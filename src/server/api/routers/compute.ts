import crypto from "node:crypto"
import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"

import { PM_DEFAULT_NODE, PM_DEFAULT_POOL } from "@/constants"
import { proxmox } from "@/lib/proxmox"
import { getNextAvailableVmid } from "@/lib/proxmox/get-next-available-vmid"
import { createComputeSchema } from "@/modules/dashboard/schemas"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import {
  auditLog as auditLogTable,
  sshKey as sshKeyTable,
  vm as vmTable,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"

export const computeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createComputeSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { name, sshKeyId, templateId } = input

      const [template] = await ctx.db
        .select()
        .from(vmTemplateTable)
        .where(eq(vmTemplateTable.id, templateId))
      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        })
      }

      const rootPassword = crypto
        .randomBytes(16)
        .toString("base64")
        .slice(0, 24)
      const hostname = `${name.toLowerCase().replaceAll(/[^a-z0-9-]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`

      const vmid = await getNextAvailableVmid()

      let sshPublicKey: string = ""
      if (sshKeyId) {
        const [sshKey] = await ctx.db
          .select()
          .from(sshKeyTable)
          .where(
            and(eq(sshKeyTable.id, sshKeyId), eq(sshKeyTable.userId, user.id)),
          )
        if (!sshKey) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "SSH Key not found",
          })
        }
        sshPublicKey = sshKey.publicKey
      }

      const [compute] = await ctx.db
        .insert(vmTable)
        .values({
          cpuCores: template.cpuCores,
          diskGb: template.diskGb,
          hostname,
          ipv4Address: "",
          memoryMb: template.memoryMb,
          name,
          proxmoxNode: PM_DEFAULT_NODE,
          proxmoxPool: PM_DEFAULT_POOL,
          rootPassword,
          sshKeyId,
          sshPublicKey,
          status: "provisioning",
          templateId: template.id,
          userId: user.id,
          vmid,
        })
        .returning()
      if (!compute) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create compute instance",
        })
      }

      try {
        await proxmox.nodes
          .$(PM_DEFAULT_NODE)
          .qemu.$(Number(template.proxmoxTemplateId))
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
            ciuser: user.name,
            cores: template.cpuCores,
            memory: String(template.memoryMb),
            nameserver: "1.1.1.1",
            searchdomain: "local",
            sshkeys: encodeURIComponent(sshPublicKey),
          })

        const diskSize = `${template.diskGb}G`
        await proxmox.nodes.$(PM_DEFAULT_NODE).qemu.$(vmid).resize.$put({
          disk: "scsi0",
          size: diskSize,
        })

        await proxmox.nodes.$(PM_DEFAULT_NODE).qemu.$(vmid).status.start.$post()

        await ctx.db
          .update(vmTable)
          .set({ status: "running" })
          .where(eq(vmTable.id, compute.id))

        await ctx.db.insert(auditLogTable).values({
          action: "compute:provision",
          details: {
            template: template.displayName,
            vmid,
            vmName: name,
          },
          resourceId: compute.id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        return {
          compute,
          credentials: {
            password: rootPassword,
            username: user.name,
          },
        }
      } catch (error) {
        console.error("Failed to provision compute instance:", error)
        await ctx.db
          .update(vmTable)
          .set({ status: "error" })
          .where(eq(vmTable.id, compute.id))

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to provision compute instance",
        })
      }
    }),
})
