import crypto from "node:crypto"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm"
import z from "zod"

import { env } from "@/env"
import { auditLog } from "@/helpers/audit"
import { notification } from "@/helpers/notification"
import { getInstanceStatus } from "@/lib/proxmox/get-instance-status"
import { getNextAvailableVmid } from "@/lib/proxmox/get-next-available-vmid"
import {
  deleteInstance,
  rebootInstance,
  shutdownInstance,
  startInstance,
  stopInstance,
} from "@/lib/proxmox/power-actions"
import { createComputeSchema } from "@/modules/dashboard/schemas"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import {
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
        await auditLog({
          action: "compute:provision_failed",
          db: ctx.db,
          details: {
            templateId,
          },
          resourceId: templateId,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Provisioning failed: Template not found`,
          status: "failure",
          userId: user.id,
        })

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
        await auditLog({
          action: "compute:provision_failed",
          db: ctx.db,
          details: {
            operatingSystemId,
          },
          resourceId: operatingSystemId,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Provisioning failed: Operating System not found`,
          status: "failure",
          userId: user.id,
        })

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
          await auditLog({
            action: "compute:provision_failed",
            db: ctx.db,
            details: {
              sshKeyId,
            },
            resourceId: sshKeyId,
            resourceType: "virtual_machine",
            userId: user.id,
          })

          await notification({
            db: ctx.db,
            message: `Provisioning failed: SSH Key not found`,
            status: "failure",
            userId: user.id,
          })

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
          proxmoxNode: env.PM_DEFAULT_NODE,
          proxmoxPool: env.PM_DEFAULT_POOL,
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
        await auditLog({
          action: "compute:provision_failed",
          db: ctx.db,
          details: {
            template: template.displayName,
            vmid,
            vmName: name,
          },
          resourceId: String(vmid),
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Provisioning failed: Failed to create compute instance`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create compute instance",
        })
      }

      // Proxmox provision worker
      // runs in a separate process to avoid blocking the request
      void startProvisionRunner()

      await auditLog({
        action: "compute:provision_requested",
        db: ctx.db,
        details: {
          template: template.displayName,
          vmid,
          vmName: name,
        },
        resourceId: compute.id,
        resourceType: "virtual_machine",
        userId: user.id,
      })

      await notification({
        db: ctx.db,
        message: `Provisioning started for compute instance "${name}"`,
        status: "info",
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

  delete: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      const [instance] = await ctx.db
        .select()
        .from(vmTable)
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!instance) {
        await auditLog({
          action: "compute:deletion_failed",
          db: ctx.db,
          details: {
            instanceId: id,
          },
          resourceId: id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Deletion failed: Compute instance not found`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      await ctx.db
        .update(vmTable)
        .set({ status: "deleting" })
        .where(eq(vmTable.id, instance.id))

      const success = await deleteInstance(instance.proxmoxNode, instance.vmid)
      if (!success) {
        await auditLog({
          action: "compute:deletion_failed",
          db: ctx.db,
          details: {
            vmid: instance.vmid,
            vmName: instance.name,
          },
          resourceId: instance.id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Deletion failed: Failed to delete instance on Proxmox`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete instance",
        })
      }

      await ctx.db.delete(vmTable).where(eq(vmTable.id, instance.id))

      await auditLog({
        action: "compute:instance_deleted",
        db: ctx.db,
        details: {
          vmid: instance.vmid,
          vmName: instance.name,
        },
        resourceId: instance.id,
        resourceType: "virtual_machine",
        userId: user.id,
      })

      await notification({
        db: ctx.db,
        message: `Compute instance "${instance.name}" has been deleted`,
        status: "info",
        userId: user.id,
      })

      return true
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
        await auditLog({
          action: "compute:fetch_failed",
          db: ctx.db,
          details: {
            instanceId: id,
          },
          resourceId: id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Fetch failed: Compute instance not found`,
          status: "failure",
          userId: user.id,
        })

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
          proxmoxNode: vmTable.proxmoxNode,
          vmid: vmTable.vmid,
        })
        .from(vmTable)
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!compute) {
        await auditLog({
          action: "compute:fetch_status_failed",
          db: ctx.db,
          details: {
            instanceId: id,
          },
          resourceId: id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Fetch status failed: Compute instance not found`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      const status = await getInstanceStatus(compute.proxmoxNode, compute.vmid)

      return status
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

  reboot: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      const [instance] = await ctx.db
        .select()
        .from(vmTable)
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!instance) {
        await auditLog({
          action: "compute:reboot_failed",
          db: ctx.db,
          details: {
            instanceId: id,
          },
          resourceId: id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Reboot failed: Compute instance not found`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      await ctx.db
        .update(vmTable)
        .set({ status: "rebooting" })
        .where(eq(vmTable.id, instance.id))

      const success = await rebootInstance(instance.proxmoxNode, instance.vmid)
      if (!success) {
        await auditLog({
          action: "compute:reboot_failed",
          db: ctx.db,
          details: {
            vmid: instance.vmid,
            vmName: instance.name,
          },
          resourceId: instance.id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Reboot failed: Failed to reboot instance on Proxmox`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reboot instance",
        })
      }

      await ctx.db
        .update(vmTable)
        .set({ status: "running" })
        .where(eq(vmTable.id, instance.id))

      await auditLog({
        action: "compute:instance_rebooted",
        db: ctx.db,
        details: {
          vmid: instance.vmid,
          vmName: instance.name,
        },
        resourceId: instance.id,
        resourceType: "virtual_machine",
        userId: user.id,
      })

      return true
    }),

  shutdown: protectedProcedure
    .input(
      z.object({
        force: z.boolean().default(false),
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id, force } = input

      const [instance] = await ctx.db
        .select()
        .from(vmTable)
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!instance) {
        await auditLog({
          action: "compute:shutdown_failed",
          db: ctx.db,
          details: {
            instanceId: id,
          },
          resourceId: id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Shutdown failed: Compute instance not found`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      const success = await shutdownInstance(
        instance.proxmoxNode,
        instance.vmid,
        force,
      )
      if (!success) {
        await auditLog({
          action: "compute:shutdown_failed",
          db: ctx.db,
          details: {
            vmid: instance.vmid,
            vmName: instance.name,
          },
          resourceId: instance.id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Shutdown failed: Failed to shutdown instance on Proxmox`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to shutdown instance",
        })
      }

      await ctx.db
        .update(vmTable)
        .set({ status: "stopped" })
        .where(eq(vmTable.id, instance.id))

      await auditLog({
        action: "compute:instance_shutdown_initiated",
        db: ctx.db,
        details: {
          vmid: instance.vmid,
          vmName: instance.name,
        },
        resourceId: instance.id,
        resourceType: "virtual_machine",
        userId: user.id,
      })

      return true
    }),

  start: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      const [instance] = await ctx.db
        .select()
        .from(vmTable)
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!instance) {
        await auditLog({
          action: "compute:start_failed",
          db: ctx.db,
          details: {
            instanceId: id,
          },
          resourceId: id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Start failed: Compute instance not found`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      const success = await startInstance(instance.proxmoxNode, instance.vmid)
      if (!success) {
        await auditLog({
          action: "compute:start_failed",
          db: ctx.db,
          details: {
            vmid: instance.vmid,
            vmName: instance.name,
          },
          resourceId: instance.id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Start failed: Failed to start instance on Proxmox`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start instance",
        })
      }

      await ctx.db
        .update(vmTable)
        .set({ status: "running" })
        .where(eq(vmTable.id, instance.id))

      await auditLog({
        action: "compute:instance_started",
        db: ctx.db,
        details: {
          vmid: instance.vmid,
          vmName: instance.name,
        },
        resourceId: instance.id,
        resourceType: "virtual_machine",
        userId: user.id,
      })

      return true
    }),

  stop: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      const [instance] = await ctx.db
        .select()
        .from(vmTable)
        .where(and(eq(vmTable.id, id), eq(vmTable.userId, user.id)))
      if (!instance) {
        await auditLog({
          action: "compute:stop_failed",
          db: ctx.db,
          details: {
            instanceId: id,
          },
          resourceId: id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Stop failed: Compute instance not found`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compute instance not found",
        })
      }

      const success = await stopInstance(instance.proxmoxNode, instance.vmid)
      if (!success) {
        await auditLog({
          action: "compute:stop_failed",
          db: ctx.db,
          details: {
            vmid: instance.vmid,
            vmName: instance.name,
          },
          resourceId: instance.id,
          resourceType: "virtual_machine",
          userId: user.id,
        })

        await notification({
          db: ctx.db,
          message: `Stop failed: Failed to stop instance on Proxmox`,
          status: "failure",
          userId: user.id,
        })

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to stop instance",
        })
      }

      await ctx.db
        .update(vmTable)
        .set({ status: "stopped" })
        .where(eq(vmTable.id, instance.id))

      await auditLog({
        action: "compute:instance_stopped",
        db: ctx.db,
        details: {
          vmid: instance.vmid,
          vmName: instance.name,
        },
        resourceId: instance.id,
        resourceType: "virtual_machine",
        userId: user.id,
      })

      return true
    }),
})
