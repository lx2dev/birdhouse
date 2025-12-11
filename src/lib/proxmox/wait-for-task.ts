import type proxmoxApi from "proxmox-api"

interface TaskStatus {
  id: string
  status: string
  exitstatus?: string
  pid: number
  starttime: number
  type: string
  node: string
  upid: string
  user: string
}

export async function* waitForTask(
  proxmox: ReturnType<typeof proxmoxApi>,
  node: string,
  upid: string,
  pollInterval: number = 2000,
): AsyncGenerator<{ status: string; logs?: string[] }, void, unknown> {
  let lastLogLine = 0

  while (true) {
    const taskStatus: TaskStatus = await proxmox.nodes
      .$(node)
      .tasks.$(upid)
      .status.$get()

    const logs = await proxmox.nodes
      .$(node)
      .tasks.$(upid)
      .log.$get({ start: lastLogLine })

    if (logs && logs.length > 0) {
      const newLogs = logs
        .map((l: { t: string }) => l.t)
        .filter((line: string) => line !== "no content")
      lastLogLine += logs.length

      yield {
        logs: newLogs,
        status: taskStatus.status,
      }
    }

    if (taskStatus.status === "stopped") {
      if (taskStatus.exitstatus !== "OK") {
        throw new Error(`Task failed: ${taskStatus.exitstatus}`)
      }
      return
    }

    await new Promise((res) => setTimeout(res, pollInterval))
  }
}
