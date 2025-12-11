"use server"

import { proxmox } from "@/lib/proxmox"
import { waitForTask } from "@/lib/proxmox/wait-for-task"

const DEFAULT_NODE = "pve01"

export async function createVmAction() {
  const upid = await proxmox.nodes.$(DEFAULT_NODE).qemu.$(9000).clone.$post({
    full: false, // If true, vm won't start due to lock error
    name: "test-vm",
    newid: 5000,
  })

  console.log("Clone started, UPID:", upid)

  // Must wait for clone to finish before configuring
  await waitForTask(proxmox, DEFAULT_NODE, upid)

  console.log("Clone finished, configuring VM...")
  await proxmox.nodes
    .$(DEFAULT_NODE)
    .qemu.$(5000)
    .config.$post({
      cores: 2,
      description: `Created at ${new Date().toISOString()}`,
      memory: "2048",
      net0: "virtio,bridge=vmbr0",
    })

  console.log("VM configured, setting up Cloud-Init...")
  await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).cloudinit.$put()

  console.log("Cloud-Init configured, starting VM...")
  await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).status.start.$post()

  console.log("VM created and started: 5000")
}
