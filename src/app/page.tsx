"use client"

import { useEffect, useRef, useState } from "react"

type LogEntry = {
  id: string
  text: string
}

export default function HomePage() {
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
      <h1 className="font-semibold text-lg">Birdhouse</h1>

      <button
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
        disabled={isRunning}
        onClick={startVmCreation}
        type="button"
      >
        {isRunning ? "Creating VM..." : "Create VM"}
      </button>

      {error && (
        <div className="mt-4 max-w-xl rounded bg-red-100 px-4 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex w-full max-w-xl flex-col">
        <span className="mb-2 font-medium text-sm">Logs</span>
        <div className="h-64 overflow-y-auto rounded border border-gray-200 bg-black px-3 py-2 text-gray-100 text-xs">
          {logs.length === 0 ? (
            <span className="text-gray-500">
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
