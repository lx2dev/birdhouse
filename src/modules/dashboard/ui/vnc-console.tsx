"use client"

import {
  IconAlertCircleFilled,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import type RFB from "novnc-next"
import * as React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

  const rfbRef = React.useRef<RFB | null>(null)
  const canvasRef = React.useRef<HTMLDivElement | null>(null)

  const [error, setError] = React.useState<string | null>(null)
  const [connected, setConnected] = React.useState(false)
  const [connecting, setConnecting] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    let onConnect: (() => void) | null = null
    let onDisconnect: ((e: CustomEvent<{ clean: boolean }>) => void) | null =
      null
    let onCredentialsRequired: (() => void) | null = null

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
          credentials: { password: ticket },
          shared: true,
          wsProtocols: ["binary"],
        })

        if (cancelled) {
          rfb.disconnect()
          return
        }

        rfbRef.current = rfb
        rfb.background = "black"
        rfb.compressionLevel = 2
        rfb.resizeSession = true
        rfb.scaleViewport = true
        rfb.showDotCursor = true

        onConnect = () => {
          if (cancelled) return
          console.log("VNC Connected!", {
            capabilities: rfb.capabilities,
            scale: rfb.scaleViewport,
          })
          setConnected(true)
          setConnecting(false)
          setError(null)
        }

        onDisconnect = (event: CustomEvent<{ clean: boolean }>) => {
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

        if (onConnect) rfb.addEventListener("connect", onConnect)
        if (onDisconnect) rfb.addEventListener("disconnect", onDisconnect)
        if (onCredentialsRequired)
          rfb.addEventListener("credentialsrequired", onCredentialsRequired)
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
          try {
            if (onConnect) rfb.removeEventListener("connect", onConnect)
            if (onDisconnect)
              rfb.removeEventListener("disconnect", onDisconnect)
            if (onCredentialsRequired)
              rfb.removeEventListener(
                "credentialsrequired",
                onCredentialsRequired,
              )
          } catch {
            // ignore
          }

          try {
            if (typeof rfb.disconnect === "function") {
              rfb.disconnect()
            }
          } catch {
            // ignore
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
        className="relative flex items-center justify-center overflow-hidden rounded-lg border border-border bg-zinc-950"
        style={{ height: "58vh" }}
      >
        <div
          className="flex size-full items-center justify-center [&>canvas]:max-h-full [&>canvas]:max-w-full"
          ref={canvasRef}
        />

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

      <div className="text-center">
        <div
          className={cn(
            "inline-block size-2 animate-pulse rounded-full",
            connected ? "bg-green-500" : "bg-red-500",
          )}
        />
        <span className="ml-2 text-muted-foreground text-xs">
          {connected
            ? "Connected to remote console"
            : connecting
              ? "Connecting..."
              : "Disconnected"}
        </span>
      </div>
    </div>
  )
}
