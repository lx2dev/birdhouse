import { eq } from "drizzle-orm"

import { PM_DEFAULT_NODE, PM_DEFAULT_POOL } from "@/constants"
import { proxmox } from "@/lib/proxmox"
import { getNextAvailableVmid } from "@/lib/proxmox/get-next-available-vmid"
import { waitForTask } from "@/lib/proxmox/wait-for-task"
import { db } from "@/server/db"
import type { VMTable } from "@/server/db/schema"
import {
  auditLog as auditLogTable,
  operatingSystem as operatingSystemTable,
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
    operatingSystemId,
    name: vmName,
    userId,
  } = vm

  if (!templateId || !operatingSystemId) {
    console.error(
      `VM ${id} has no templateId or operatingSystemId, cannot provision`,
    )
    await db
      .update(vmTable)
      .set({
        status: "error",
      })
      .where(eq(vmTable.id, id))
    return
  }

  try {
    const [operatingSystem] = await db
      .select()
      .from(operatingSystemTable)
      .where(eq(operatingSystemTable.id, operatingSystemId))
    const [template] = await db
      .select()
      .from(vmTemplateTable)
      .where(eq(vmTemplateTable.id, templateId))

    if (!template || !operatingSystem) {
      throw new Error(`Template or operating system not found for VM ${id}`)
    }

    let effectiveVmid = vmid
    let cloneUpid: string | undefined

    try {
      cloneUpid = await proxmox.nodes
        .$(PM_DEFAULT_NODE)
        .qemu.$(operatingSystem.proxmoxTemplateId)
        .clone.$post({
          full: true,
          name: hostname,
          newid: effectiveVmid,
          pool: PM_DEFAULT_POOL,
        })

      for await (const update of waitForTask(
        proxmox,
        PM_DEFAULT_NODE,
        cloneUpid,
        POLL_INTERVAL_MS,
      )) {
        if (update.logs) {
          for (const line of update.logs)
            console.log(`[proxmox:${cloneUpid}] ${line}`)
        }
      }
    } catch (error: unknown) {
      let msg: string
      if (typeof error === "object" && error !== null && "message" in error) {
        msg = String((error as { message?: unknown }).message)
      } else {
        msg = String(error)
      }

      if (
        msg.includes("config file already exists") ||
        msg.includes("unable to create VM")
      ) {
        console.warn(
          `VMID ${effectiveVmid} already exists on Proxmox, picking a new VMID and retrying`,
        )
        const newVmid = await getNextAvailableVmid()
        effectiveVmid = newVmid

        try {
          await db
            .update(vmTable)
            .set({ vmid: effectiveVmid })
            .where(eq(vmTable.id, id))
        } catch (e) {
          console.warn(
            `Failed to persist new vmid ${effectiveVmid} for VM ${id}:`,
            e,
          )
        }

        cloneUpid = await proxmox.nodes
          .$(PM_DEFAULT_NODE)
          .qemu.$(operatingSystem.proxmoxTemplateId)
          .clone.$post({
            full: true,
            name: hostname,
            newid: effectiveVmid,
            pool: PM_DEFAULT_POOL,
          })

        for await (const update of waitForTask(
          proxmox,
          PM_DEFAULT_NODE,
          cloneUpid,
          POLL_INTERVAL_MS,
        )) {
          if (update.logs) {
            for (const line of update.logs)
              console.log(`[proxmox:${cloneUpid}] ${line}`)
          }
        }
      } else {
        console.error(`Cloning VM failed for VM ${id}:`, error)
        throw error
      }
    }

    await proxmox.nodes
      .$(PM_DEFAULT_NODE)
      .qemu.$(effectiveVmid)
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
    await proxmox.nodes.$(PM_DEFAULT_NODE).qemu.$(effectiveVmid).resize.$put({
      disk: "scsi0",
      size: diskSize,
    })

    await proxmox.nodes
      .$(PM_DEFAULT_NODE)
      .qemu.$(effectiveVmid)
      .status.start.$post()

    await db
      .update(vmTable)
      .set({ status: "running" })
      .where(eq(vmTable.id, id))

    await db.insert(auditLogTable).values({
      action: "compute:provision",
      details: {
        template: template.displayName,
        vmid: effectiveVmid,
        vmName,
      },
      resourceId: id,
      resourceType: "virtual_machine",
      userId,
    })

    console.log(`Provisioned VM ${id} (vmid=${effectiveVmid})`)
  } catch (err) {
    console.error(`Failed to provision VM ${id}:`, err)
    await db
      .update(vmTable)
      .set({
        status: "error",
      })
      .where(eq(vmTable.id, id))
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
