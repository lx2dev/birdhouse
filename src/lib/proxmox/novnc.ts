import { getProxmoxClient } from "@/lib/proxmox"

export async function getVNCTicket(
  node: string,
  vmid: number,
): Promise<{ ticket: string; port: number }> {
  const proxmox = getProxmoxClient()

  try {
    const res = await proxmox.nodes.$(node).qemu.$(vmid).vncproxy.$post({
      websocket: true,
    })

    return {
      port: res.port,
      ticket: res.ticket,
    }
  } catch (error) {
    console.error("Failed to get VNC ticket:", error)
    throw error
  }
}
