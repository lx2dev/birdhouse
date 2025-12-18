import { getProxmoxClient } from "@/lib/proxmox"

export interface InstanceStatus {
  status: string
  cpuUsage: number
  memoryUsed: number
  memoryTotal: number
  diskTotal: number
  uptime: number
}

export async function getInstanceStatus(
  node: string,
  vmid: number,
): Promise<InstanceStatus | null> {
  const proxmox = getProxmoxClient()

  try {
    const status = await proxmox.nodes
      .$(node)
      .qemu.$(vmid)
      .status.current.$get()

    return {
      cpuUsage: status.cpu || 0,
      diskTotal: status.maxdisk || 0,
      memoryTotal: status.maxmem || 0,
      memoryUsed: status.mem || 0,
      status: status.status,
      uptime: status.uptime || 0,
    }
  } catch (error) {
    console.error(
      `Failed to get status for VMID ${vmid} on node ${node}:`,
      error,
    )
    return null
  }
}
