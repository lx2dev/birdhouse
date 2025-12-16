import { eq } from "drizzle-orm"

import { PM_DEFAULT_NODE, PM_DEFAULT_POOL } from "@/constants"
import { proxmox } from "@/lib/proxmox"
import { db } from "@/server/db"
import type { VMTable } from "@/server/db/schema"
import {
  auditLog as auditLogTable,
  vm as vmTable,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"

const POLL_INTERVAL_MS = 5000

async function processOne(vm: VMTable) {
  const {
    id,
    vmid,
    hostname,
    rootPassword,
    sshPublicKey,
    templateId,
    name: vmName,
    userId,
  } = vm

  try {
    const [template] = await db
      .select()
      .from(vmTemplateTable)
      .where(eq(vmTemplateTable.id, templateId))

    await proxmox.nodes
      .$(PM_DEFAULT_NODE)
      .qemu.$(template.proxmoxTemplateId)
      .clone.$post({
        full: true,
        name: hostname,
        newid: vmid,
        pool: PM_DEFAULT_POOL,
      })

    await proxmox.nodes
      .$(PM_DEFAULT_NODE)
      .qemu.$(vmid)
      .config.$post({
        cipassword: rootPassword,
        ciuser: "root",
        cores: template.cpuCores,
        memory: String(template.memoryMb),
        nameserver: "1.1.1.1",
        searchdomain: "local",
        sshkeys: encodeURIComponent(sshPublicKey || ""),
      })

    const diskSize = `${template.diskGb}G`
    await proxmox.nodes.$(PM_DEFAULT_NODE).qemu.$(vmid).resize.$put({
      disk: "scsi0",
      size: diskSize,
    })

    await proxmox.nodes.$(PM_DEFAULT_NODE).qemu.$(vmid).status.start.$post()

    await db
      .update(vmTable)
      .set({ status: "running" })
      .where(eq(vmTable.id, id))

    await db.insert(auditLogTable).values({
      action: "compute:provision",
      details: {
        template: template.displayName,
        vmid,
        vmName,
      },
      resourceId: id,
      resourceType: "virtual_machine",
      userId,
    })

    console.log(`Provisioned VM ${id} (vmid=${vmid})`)
  } catch (err) {
    console.error(`Failed to provision VM ${id}:`, err)
    await db.update(vmTable).set({ status: "error" }).where(eq(vmTable.id, id))
  }
}

async function poll() {
  try {
    const vms = await db
      .select()
      .from(vmTable)
      .where(eq(vmTable.status, "provisioning"))
      .limit(5)

    for (const vm of vms) {
      // process sequentially to avoid hammering proxmox
      // best-effort: a single runner instance should be used in production
      await processOne(vm)
    }
  } catch (err) {
    console.error("Provision runner poll error:", err)
  }
}

async function start() {
  console.log(
    "Provision runner starting, polling every",
    POLL_INTERVAL_MS,
    "ms",
  )
  while (true) {
    await poll()
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
}

if (require.main === module) void start()

export { start as startProvisionRunner }
