import { getProxmoxClient } from "@/lib/proxmox"
import { waitForTask } from "@/lib/proxmox/wait-for-task"

// TODO: Must await task completion for all actions before returning success and updating db

export async function startInstance(
  node: string,
  vmid: number,
): Promise<boolean> {
  const proxmox = getProxmoxClient()

  try {
    await proxmox.nodes.$(node).qemu.$(vmid).status.start.$post()
    return true
  } catch (error) {
    console.log(`Failed to start instance ${vmid} on node ${node}:`, error)
    return false
  }
}

export async function shutdownInstance(
  node: string,
  vmid: number,
  force: boolean = false,
): Promise<boolean> {
  const proxmox = getProxmoxClient()

  try {
    await proxmox.nodes.$(node).qemu.$(vmid).status.shutdown.$post({
      forceStop: force,
    })
    return true
  } catch (error) {
    console.log(`Failed to shutdown instance ${vmid} on node ${node}:`, error)
    return false
  }
}

export async function stopInstance(
  node: string,
  vmid: number,
): Promise<boolean> {
  const proxmox = getProxmoxClient()

  try {
    await proxmox.nodes.$(node).qemu.$(vmid).status.stop.$post()
    return true
  } catch (error) {
    console.log(`Failed to stop instance ${vmid} on node ${node}:`, error)
    return false
  }
}

export async function rebootInstance(
  node: string,
  vmid: number,
): Promise<boolean> {
  const proxmox = getProxmoxClient()

  try {
    const upid = await proxmox.nodes.$(node).qemu.$(vmid).status.reboot.$post()
    for await (const task of waitForTask(proxmox, node, upid)) {
      if (task.status === "error") {
        return false
      }
    }
    return true
  } catch (error) {
    console.log(`Failed to reboot instance ${vmid} on node ${node}:`, error)
    return false
  }
}

export async function deleteInstance(
  node: string,
  vmid: number,
): Promise<boolean> {
  const proxmox = getProxmoxClient()

  try {
    const isRunning = await proxmox.nodes
      .$(node)
      .qemu.$(vmid)
      .status.current.$get()
    if (isRunning.status === "running") {
      await proxmox.nodes.$(node).qemu.$(vmid).status.stop.$post()
    }

    await proxmox.nodes.$(node).qemu.$(vmid).$delete()
    return true
  } catch (error) {
    console.log(`Failed to delete instance ${vmid} on node ${node}:`, error)
    return false
  }
}
