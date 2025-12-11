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

export async function waitForTask(
  proxmox: ReturnType<typeof proxmoxApi>,
  node: string,
  upid: string,
  pollInterval: number = 2000,
  timeout: number = 300000,
): Promise<void> {
  const startTime = Date.now()

  while (true) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Task ${upid} timed out after ${timeout} ms`)
    }

    const taskStatus: TaskStatus = await proxmox.nodes
      .$(node)
      .tasks.$(upid)
      .status.$get()

    if (taskStatus.status === "stopped") {
      if (taskStatus.exitstatus === "OK") return

      throw new Error(
        `Task failed with exit status: ${taskStatus.exitstatus ?? "unknown"}`,
      )
    }

    await new Promise((res) => setTimeout(res, pollInterval))
  }
}
