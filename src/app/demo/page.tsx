"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

type LogEntry = {
  id: string
  text: string
}

export default function DemoPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  function startVmCreation() {
    if (isRunning) return

    setLogs([])
    setError(null)
    setIsRunning(true)

    const es = new EventSource("/api/vm/create")
    eventSourceRef.current = es

    es.onmessage = (event) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      setLogs((prev) => [...prev, { id, text: event.data }])
    }

    es.addEventListener("done", () => {
      setIsRunning(false)
      es.close()
    })

    es.addEventListener("error", () => {
      setIsRunning(false)
      es.close()
      setError("An error occurred during VM creation.")
    })
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link className="self-start" href="/">
        <Button variant="link">
          <IconArrowLeft /> Home
        </Button>
      </Link>

      <h1 className="font-semibold text-lg">Birdhouse</h1>

      <Button disabled={isRunning} onClick={startVmCreation} size="lg">
        {isRunning ? "Creating VM..." : "Create VM"}
      </Button>

      {error && (
        <div className="mt-4 max-w-xl rounded-(--radius) bg-destructive/10 px-4 py-2 text-destructive text-sm dark:bg-destructive/20">
          {error}
        </div>
      )}

      <div className="mt-6 flex w-full max-w-xl flex-col">
        <span className="mb-2 font-medium text-sm">Logs</span>
        <div className="h-64 overflow-y-auto rounded border bg-black px-3 py-2 text-xs text-zinc-100">
          {logs.length === 0 ? (
            <span className="font-mono text-muted-foreground">
              No logs yet. Click "Create VM" to start.
            </span>
          ) : (
            logs.map((entry) => (
              <div className="whitespace-pre-wrap font-mono" key={entry.id}>
                {entry.text}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
