"use client"

import { IconAlertCircleFilled, IconLoader2 } from "@tabler/icons-react"
import RFB from "novnc-next"
import * as React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface VNCConsoleProps {
  host: string
  port: number
  ticket: string
  vmid: number
}

export function VNCConsole(props: VNCConsoleProps) {
  const { host, port, ticket, vmid } = props

  const [error, setError] = React.useState<string | null>(null)
  const [connected, setConnected] = React.useState(false)
  const [connecting, setConnecting] = React.useState(true)
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const rfbRef = React.useRef<any>(null)

  React.useEffect(() => {
    let rfb: any = null

    const initVNC = async () => {
      if (!canvasRef.current) return

      try {
        // Dynamic import to avoid SSR issues
        const RFB = (await import("novnc-next")).default

        // Construct WebSocket URL for Proxmox noVNC
        const wsUrl = `wss://${host}:${port}/?vncticket=${encodeURIComponent(ticket)}`

        console.log("Connecting to VNC:", wsUrl)

        // Create RFB instance
        rfb = new RFB(canvasRef.current, wsUrl, {
          credentials: {}, // Ticket is in URL for Proxmox
        })

        rfbRef.current = rfb

        // Set options
        rfb.scaleViewport = true
        rfb.resizeSession = false
        rfb.showDotCursor = true

        // Event listeners
        rfb.addEventListener("connect", () => {
          console.log("VNC connected successfully")
          setConnected(true)
          setConnecting(false)
          setError(null)
        })

        rfb.addEventListener("disconnect", (e: any) => {
          console.log("VNC disconnected:", e.detail)
          setConnected(false)
          setConnecting(false)
          if (e.detail.clean === false) {
            setError("Connection lost. Please refresh to reconnect.")
          }
        })

        rfb.addEventListener("credentialsrequired", () => {
          console.log("VNC credentials required")
          setError("Authentication failed. Invalid ticket.")
          setConnecting(false)
        })

        rfb.addEventListener("securityfailure", (e: any) => {
          console.error("VNC security failure:", e.detail)
          setError(`Security failure: ${e.detail.reason}`)
          setConnecting(false)
        })
      } catch (err: any) {
        console.error("Failed to initialize VNC:", err)
        setError(err?.message || "Failed to initialize console")
        setConnecting(false)
      }
    }

    initVNC()

    // Cleanup on unmount
    return () => {
      if (rfbRef.current) {
        console.log("Disconnecting VNC")
        rfbRef.current.disconnect()
      }
    }
  }, [host, port, ticket])

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <IconAlertCircleFilled className="size-4 text-destructive" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {connecting && !error && (
        <div className="flex items-center justify-center rounded-lg bg-muted p-8">
          <div className="space-y-2 text-center">
            <IconLoader2 className="mx-auto size-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Connecting to console...
            </p>
          </div>
        </div>
      )}

      <div
        className="overflow-hidden rounded-lg border border-border bg-black"
        ref={canvasRef}
        style={{ minHeight: "600px", width: "100%" }}
      />

      {connected && (
        <p className="text-center text-muted-foreground text-xs">
          Connected to VM {vmid} • Use Ctrl+Alt+Delete menu for special keys
        </p>
      )}
    </div>
  )
}
