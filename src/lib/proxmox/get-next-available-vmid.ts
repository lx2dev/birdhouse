import { env } from "@/env"
import { getProxmoxClient } from "@/lib/proxmox"

const USER_VMID_START = 5000
const USER_VMID_END = 5999

export async function getNextAvailableVmid(): Promise<number> {
  const proxmox = getProxmoxClient()
  const node = env.PM_DEFAULT_NODE

  try {
    const vms = await proxmox.nodes.$(node).qemu.$get()
    const usedVmids = new Set(vms.map((vm) => vm.vmid))

    // Find first available VMID in user range (5000-5999)
    for (let vmid = USER_VMID_START; vmid <= USER_VMID_END; vmid++) {
      if (!usedVmids.has(vmid)) {
        return vmid
      }
    }

    throw new Error(
      `No available VMIDs in user range (${USER_VMID_START}-${USER_VMID_END})`,
    )
  } catch (error) {
    console.error("Failed to get next VMID:", error)
    throw error
  }
}
