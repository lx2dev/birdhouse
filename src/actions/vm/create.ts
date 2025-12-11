"use server"

import { proxmox } from "@/lib/proxmox"
import { waitForTask } from "@/lib/proxmox/wait-for-task"

const DEFAULT_NODE = "pve01"

export async function createVmAction() {
  const cloneUpid = await proxmox.nodes
    .$(DEFAULT_NODE)
    .qemu.$(9000)
    .clone.$post({
      full: true,
      name: "test-vm",
      newid: 5000,
    })

  for await (const update of waitForTask(proxmox, DEFAULT_NODE, cloneUpid)) {
    if (update.logs) {
      console.log(update.logs.join("\n"))
    }
  }

  console.log("Configuring VM...")

  await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).config.$post({
    cipassword: "cloudpassword",
    ciuser: "clouduser",
    cores: 2,
    memory: "2048",
  })
  await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).cloudinit.$put()

  console.log("Starting VM...")

  const startUpid = await proxmox.nodes
    .$(DEFAULT_NODE)
    .qemu.$(5000)
    .status.start.$post()

  await waitForTask(proxmox, DEFAULT_NODE, startUpid).next()
}
