import type { ClientRequest, IncomingMessage } from "node:http"
import { createServer } from "node:http"
import type { Duplex } from "node:stream"
import { parse } from "node:url"
import next from "next"
import type { ClientOptions, RawData } from "ws"
import { WebSocket, WebSocketServer } from "ws"

import { env } from "./src/env"
import { auth } from "./src/server/auth"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

function toHeaders(req: IncomingMessage) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers.set(key, value)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item as string)
      }
    }
  }
  return headers
}

function normalizeHost(host: string) {
  return host
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/:\d+$/, "")
}

function bufferReason(reason?: Buffer) {
  if (!reason || reason.length === 0) return undefined
  return reason.toString()
}

function pipeSockets(client: WebSocket, upstream: WebSocket) {
  const closeBoth = (code: number, reason?: string) => {
    if (client.readyState === WebSocket.OPEN) client.close(code, reason)
    if (upstream.readyState === WebSocket.OPEN) upstream.close(code, reason)
  }

  client.on("message", (data, isBinary) => {
    if (upstream.readyState === WebSocket.OPEN) {
      upstream.send(data, { binary: isBinary })
    }
  })

  upstream.on("message", (data) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data, { binary: true })
    }
  })

  client.on("close", (code, reason) => {
    upstream.close(code, bufferReason(reason))
  })

  upstream.on("close", (code, reason) => {
    client.close(code, bufferReason(reason))
  })

  client.on("error", () => closeBoth(1011, "Client error"))
  upstream.on("error", () => closeBoth(1011, "Upstream error"))
}

function connectToProxmox(params: {
  host: string
  node: string
  port: string
  ticket: string
  vmid: string
  protocols?: string | string[] | undefined
  extraHeaders?: Record<string, string>
}) {
  const { host, node, port, ticket, vmid } = params

  const sanitizedHost = normalizeHost(host)
  const upstreamUrl = `wss://${sanitizedHost}:8006/api2/json/nodes/${encodeURIComponent(
    node,
  )}/qemu/${vmid}/vncwebsocket?port=${encodeURIComponent(
    port,
  )}&vncticket=${encodeURIComponent(ticket)}`

  const protocols = params.protocols
  const extraHeaders = params.extraHeaders

  const options: ClientOptions = {
    perMessageDeflate: false,
    rejectUnauthorized:
      env.PM_TLS_SKIP_VERIFY !== "true" && env.NODE_ENV !== "development",
  }

  if (extraHeaders) options.headers = extraHeaders

  if (env.PM_TOKEN_ID && env.PM_SECRET) {
    options.headers = {
      ...options.headers,
      Authorization: `PVEAPIToken=${env.PM_TOKEN_ID}=${env.PM_SECRET}`,
    }
  }

  const effectiveProtocols = protocols || ["binary"]

  return new WebSocket(upstreamUrl, effectiveProtocols, options)
}

if (env.PM_TLS_SKIP_VERIFY === "true" || env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "", true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  const wss = new WebSocketServer({
    handleProtocols: (protocols) => {
      if (protocols.has("binary")) {
        return "binary"
      }
      return Array.from(protocols)[0]
    },
    noServer: true,
  })

  server.on(
    "upgrade",
    async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
      const parsed = parse(req.url || "", true)
      const { pathname, query } = parsed

      if (pathname === "/api/vnc") {
        const headers = toHeaders(req)
        const session = await auth.api.getSession({ headers })

        if (!session) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
          socket.destroy()
          return
        }

        const node = query.node as string
        const host = query.host as string
        const port = query.port as string
        const ticket = query.ticket as string
        const vmid = query.vmid as string

        if (!node || !host || !port || !ticket || !vmid) {
          socket.write("HTTP/1.1 400 Bad Request\r\n\r\n")
          socket.destroy()
          return
        }

        console.log(`[VNC] Attempting connection to ${host} for VM ${vmid}`)

        wss.handleUpgrade(req, socket, head, (client) => {
          const requestedProtocols = req.headers["sec-websocket-protocol"] as
            | string
            | undefined
          const protocols = requestedProtocols
            ? requestedProtocols.split(",").map((s) => s.trim())
            : undefined

          const sanitizedHost = normalizeHost(host)
          const extraHeaders = {
            Origin: `https://${sanitizedHost}:8006`,
          }

          const upstream = connectToProxmox({
            extraHeaders,
            host,
            node,
            port,
            protocols,
            ticket,
            vmid,
          })

          console.log(`[VNC] Upstream created, waiting for open...`)

          const messageBuffer: { data: RawData; isBinary: boolean }[] = []
          const bufferMessage = (data: RawData, isBinary: boolean) => {
            messageBuffer.push({ data, isBinary })
          }
          client.on("message", bufferMessage)

          function handleUpstreamOpen() {
            console.log(`[VNC] Upstream open! Piping sockets.`)
            client.off("message", bufferMessage)

            if (messageBuffer.length > 0) {
              console.log(
                `[VNC] Replaying ${messageBuffer.length} buffered messages to upstream`,
              )
              for (const { data, isBinary } of messageBuffer) {
                upstream.send(data, { binary: isBinary })
              }
            }

            pipeSockets(client, upstream)
          }

          function handleUpstreamError(err: Error) {
            console.error("[VNC] Upstream WebSocket error:", err)
            try {
              client.close(1011, "Upstream error")
            } catch {
              // ignore
            }
          }

          function handleUpstreamUnexpectedResponse(
            _req: ClientRequest,
            res: IncomingMessage,
          ) {
            console.error(
              `[VNC] Unexpected response from upstream: ${res.statusCode} ${res.statusMessage}`,
            )
            let data = ""
            res.on("data", (chunk: Buffer) => {
              data += chunk.toString()
            })
            res.on("end", () => {
              if (data) {
                console.error(`[VNC] Response body: ${data}`)
              }
            })
          }

          function handleUpstreamClose(code: number, reason: Buffer) {
            console.log("[VNC] Upstream closed:", code, reason.toString())
          }

          upstream.once("open", handleUpstreamOpen)
          upstream.once("error", handleUpstreamError)
          upstream.once("unexpected-response", handleUpstreamUnexpectedResponse)
          upstream.once("close", handleUpstreamClose)
        })
      } else if (
        "getUpgradeHandler" in app &&
        typeof (
          app as unknown as {
            getUpgradeHandler?: () => (
              req: IncomingMessage,
              socket: Duplex,
              head: Buffer,
            ) => void
          }
        ).getUpgradeHandler === "function"
      ) {
        ;(
          app as unknown as {
            getUpgradeHandler: () => (
              req: IncomingMessage,
              socket: Duplex,
              head: Buffer,
            ) => void
          }
        ).getUpgradeHandler()(req, socket, head)
      } else {
        socket.destroy()
      }
    },
  )

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
