import crypto from "node:crypto"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm"
import z from "zod"

import { PM_DEFAULT_NODE, PM_DEFAULT_POOL } from "@/constants"
import { getNextAvailableVmid } from "@/lib/proxmox/get-next-available-vmid"
import { createComputeSchema } from "@/modules/dashboard/schemas"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import {
  auditLog as auditLogTable,
  operatingSystem as osTable,
  sshKey as sshKeyTable,
  vm as vmTable,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"
import { startProvisionRunner } from "@/server/workers/provision-runner"

export const computeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createComputeSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { name, sshKeyId, templateId, operatingSystemId } = input

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

      const [operatingSystem] = await ctx.db
        .select()
        .from(osTable)
        .where(eq(osTable.id, operatingSystemId))
      if (!operatingSystem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Operating System not found",
        })
      }

      const rootPassword = crypto
        .randomBytes(16)
        .toString("base64")
        .slice(0, 24)

      const sanitizedUsername = user.name
        .toLowerCase()
        .replaceAll(/[^a-z0-9-]/g, "-")
      const sanitizedVMName = name.toLowerCase().replaceAll(/[^a-z0-9-]/g, "-")
      const randomHex = crypto.randomBytes(3).toString("hex")
      const hostname = `${sanitizedUsername}-${sanitizedVMName}-${randomHex}`

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

      // TODO: below
      // const ipv4Address = await getIPv4Address(vmid)

      const [compute] = await ctx.db
        .insert(vmTable)
        .values({
          cpuCores: template.cpuCores,
          diskGb: template.diskGb,
          hostname,
          ipv4Address: "",
          memoryMb: template.memoryMb,
          name,
          operatingSystemId: operatingSystem.id,
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

      // Proxmox provision worker
      // runs in a separate process to avoid blocking the request
      void startProvisionRunner()

      await ctx.db.insert(auditLogTable).values({
        action: "compute:provision_requested",
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
    }),

  getInstance: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      const [compute] = await ctx.db
        .select({
          ...getTableColumns(vmTable),
          os: {
            ...getTableColumns(osTable),
          },
          template: {
            ...getTableColumns(vmTemplateTable),
          },
        })
        .from(vmTable)
        .innerJoin(vmTemplateTable, eq(vmTemplateTable.id, vmTable.templateId))
        .innerJoin(osTable, eq(osTable.id, vmTable.operatingSystemId))
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!compute) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      return compute
    }),

  getInstanceStatus: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      const [compute] = await ctx.db
        .select({
          status: vmTable.status,
        })
        .from(vmTable)
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!compute) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      // TODO: implement real-time status fetching from Proxmox
      // const status = await getVMStatus(compute.vmid)

      return compute.status
    }),

  list: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.uuid(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { cursor, limit } = input

      const vms = await ctx.db
        .select()
        .from(vmTable)
        .where(
          and(
            eq(vmTable.userId, user.id),
            cursor
              ? or(
                  lt(vmTable.createdAt, cursor.createdAt),
                  and(
                    eq(vmTable.id, cursor.id),
                    eq(vmTable.createdAt, cursor.createdAt),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(vmTable.createdAt))
        .limit(limit + 1)

      const hasMore = vms.length > limit
      const items = hasMore ? vms.slice(0, -1) : vms
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            createdAt: lastItem.createdAt,
            id: lastItem.id,
          }
        : null

      return {
        items,
        nextCursor,
      }
    }),
})
