"use client"

import {
  IconAlertCircleFilled,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface VNCConsoleProps {
  host: string
  node: string
  port: number
  ticket: string
  vmid: number
}

export function VNCConsole(props: VNCConsoleProps) {
  const { host, node, port, ticket, vmid } = props

  const router = useRouter()

  const rfbRef = React.useRef<any>(null)
  const canvasRef = React.useRef<HTMLDivElement | null>(null)

  const [error, setError] = React.useState<string | null>(null)
  const [connected, setConnected] = React.useState(false)
  const [connecting, setConnecting] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    let onConnect: ((e?: any) => void) | null = null
    let onDisconnect: ((e?: any) => void) | null = null
    let onCredentialsRequired: (() => void) | null = null
    let onSecurityFailure: ((e?: any) => void) | null = null

    async function initVNC() {
      if (!canvasRef.current) return

      setConnecting(true)
      setConnected(false)
      setError(null)

      try {
        const RFB = (await import("novnc-next")).default

        const sanitizedHost = host
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "")
          .replace(/:\d+$/, "")

        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws"
        const search = new URLSearchParams({
          host: sanitizedHost,
          node,
          port: String(port),
          ticket,
          vmid: String(vmid),
        })

        const wsUrl = `${wsProtocol}://${window.location.host}/api/vnc?${search.toString()}`

        const rfb = new RFB(canvasRef.current, wsUrl, {
          credentials: {},
        })

        if (cancelled) {
          rfb.disconnect()
          return
        }

        rfbRef.current = rfb
        rfb.scaleViewport = true
        rfb.resizeSession = true
        rfb.showDotCursor = true

        onConnect = () => {
          if (cancelled) return
          setConnected(true)
          setConnecting(false)
          setError(null)
        }

        onDisconnect = (event: any) => {
          if (cancelled) return
          setConnected(false)
          setConnecting(false)
          if (event?.detail?.clean === false) {
            setError("Connection lost. Please refresh to reconnect.")
          }
        }

        onCredentialsRequired = () => {
          if (cancelled) return
          setError("Authentication failed. Invalid ticket.")
          setConnecting(false)
        }

        onSecurityFailure = (event: any) => {
          if (cancelled) return
          setError(
            `Security failure: ${
              event?.detail?.reason ?? "Unable to negotiate encryption"
            }`,
          )
          setConnecting(false)
        }

        if (onConnect) rfb.addEventListener("connect", onConnect)
        if (onDisconnect) rfb.addEventListener("disconnect", onDisconnect)
        if (onCredentialsRequired)
          rfb.addEventListener("credentialsrequired", onCredentialsRequired)
        if (onSecurityFailure)
          rfb.addEventListener("securityfailure", onSecurityFailure)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : "Failed to initialize console"
        setError(message)
        setConnecting(false)
      }
    }

    void initVNC()

    return () => {
      cancelled = true
      const rfb = rfbRef.current
      if (rfb) {
        try {
          // remove listeners we added
          try {
            rfb.removeEventListener("connect", onConnect)
            rfb.removeEventListener("disconnect", onDisconnect)
            rfb.removeEventListener(
              "credentialsrequired",
              onCredentialsRequired,
            )
            rfb.removeEventListener("securityfailure", onSecurityFailure)
          } catch (e) {
            // ignore remove errors
          }

          // disconnect may throw if already disconnected; guard with try/catch
          try {
            if (typeof rfb.disconnect === "function") {
              rfb.disconnect()
            }
          } catch (e) {
            // ignore disconnect errors from novnc
          }
        } finally {
          rfbRef.current = null
        }
      }
    }
  }, [host, node, port, ticket, vmid])

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="flex items-center" variant="destructive">
          <IconAlertCircleFilled className="size-4 text-destructive" />
          <AlertDescription>{error}</AlertDescription>
          {error.includes("refresh") && (
            <Button
              onClick={() => router.refresh()}
              size="xs"
              variant="outline"
            >
              <IconRefresh />
              Refresh
            </Button>
          )}
        </Alert>
      )}

      <div
        className="relative overflow-hidden rounded-lg border border-border bg-black"
        style={{ minHeight: "600px", width: "100%" }}
      >
        <div className="h-full w-full" ref={canvasRef} />

        {connecting && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="space-y-2 text-center">
              <IconLoader2 className="mx-auto size-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Connecting to console...
              </p>
            </div>
          </div>
        )}
      </div>

      {connected && (
        <p className="text-center text-muted-foreground text-xs">
          Connected to VM {vmid} • Use Ctrl+Alt+Delete for special keys
        </p>
      )}
    </div>
  )
}
