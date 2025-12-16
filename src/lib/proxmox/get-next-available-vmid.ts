import { proxmox } from "@/lib/proxmox"

export async function getNextAvailableVmid(): Promise<number> {
  try {
    const resources = await proxmox.nodes.$get()

    let maxVmid = 99

    for (const resource of resources) {
      if (resource.vmid && resource.vmid > maxVmid) {
        maxVmid = resource.vmid
      }
    }

    return maxVmid + 1
  } catch (error) {
    console.error("Failed to get next VMID:", error)
    return Math.floor(Math.random() * (999999 - 100 + 1)) + 100
  }
}
