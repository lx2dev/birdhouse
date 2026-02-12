import { env } from "@/env"
import { getProxmoxClient } from "@/lib/proxmox"

export async function getNextAvailableVmid(): Promise<number> {
  const proxmox = getProxmoxClient()

  try {
    const maxVmid = await getMaxVmid(proxmox)
    return maxVmid + 1
  } catch (error) {
    console.error("Failed to get next VMID:", error)
    return Math.floor(Math.random() * (999999 - 100 + 1)) + 100
  }
}

/**
 * Find the first unused VMID starting from `startFrom` by checking Proxmox.
 * Useful for retries when a collision is detected.
 */
export async function findFirstUnusedVmid(
  startFrom: number,
  maxAttempts = 100,
): Promise<number> {
  const proxmox = getProxmoxClient()
  const node = env.PM_DEFAULT_NODE

  let candidate = startFrom
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const vms = await proxmox.nodes.$(node).qemu.$get()
      const usedVmids = new Set(vms.map((vm) => vm.vmid))

      while (usedVmids.has(candidate)) {
        candidate++
      }

      return candidate
    } catch (error) {
      console.warn(
        `Attempt ${i + 1}/${maxAttempts} to find unused VMID failed:`,
        error,
      )
      if (i === maxAttempts - 1) throw error
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  throw new Error("Could not find an unused VMID after max attempts")
}

async function getMaxVmid(proxmox: ReturnType<typeof getProxmoxClient>) {
  let maxVmid = 99

  try {
    const resources = await proxmox.cluster.resources.$get({ type: "vm" })
    for (const resource of resources) {
      const vmid = Number(resource.vmid)
      if (Number.isFinite(vmid) && vmid > maxVmid) maxVmid = vmid
    }
    return maxVmid
  } catch (error) {
    console.warn(
      "Failed to fetch cluster resources, falling back to node:",
      error,
    )
  }

  const node = env.PM_DEFAULT_NODE
  const vms = await proxmox.nodes.$(node).qemu.$get()
  for (const vm of vms) {
    const vmid = Number(vm.vmid)
    if (Number.isFinite(vmid) && vmid > maxVmid) maxVmid = vmid
  }

  return maxVmid
}
