"use server"

import { proxmox } from "@/lib/proxmox"

const DEFAULT_NODE = "pve01"

export async function createVmAction() {
  await proxmox.nodes.$(DEFAULT_NODE).qemu.$(9000).clone.$post({
    full: false, // If true, vm won't start due to lock error
    name: "test-vm",
    newid: 5000,
  })

  // Must wait for clone to finish before configuring

  await proxmox.nodes
    .$(DEFAULT_NODE)
    .qemu.$(5000)
    .config.$post({
      cores: 2,
      description: `Created at ${new Date().toISOString()}`,
      memory: "2048",
      net0: "virtio,bridge=vmbr0",
    })

  await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).cloudinit.$put()
  await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).status.start.$post()
}
