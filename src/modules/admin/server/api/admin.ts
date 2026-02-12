import { TRPCError } from "@trpc/server"
import { count, eq } from "drizzle-orm"

import { logAndNotify } from "@/helpers/audit/log-and-notify"
import {
  insertOperatingSystemSchema,
  insertVMTemplateSchema,
  updateVMTemplateSchema,
} from "@/modules/admin/schemas"
import { adminProcedure, createTRPCRouter } from "@/server/api/init"
import {
  operatingSystem as osTable,
  user as userTable,
  vm as vmTable,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [[userCount], [pendingApprovalCount], [vmCount]] = await Promise.all([
      ctx.db.select({ count: count() }).from(userTable),
      ctx.db
        .select({ count: count() })
        .from(userTable)
        .where(eq(userTable.approved, false)),
      ctx.db.select({ count: count() }).from(vmTable),
    ])

    return {
      pendingApprovalCount: pendingApprovalCount.count || 0,
      userCount: userCount.count || 0,
      vmCount: vmCount.count || 0,
    }
  }),

  os: createTRPCRouter({
    create: adminProcedure
      .input(insertOperatingSystemSchema)
      .mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.session.user

        const name = input.displayName.trim().toLowerCase().replace(/\s+/g, "-")

        const [os] = await ctx.db
          .insert(osTable)
          .values({
            displayName: input.displayName,
            name,
            osType: input.osType,
            osVersion: input.osVersion,
            proxmoxTemplateId: input.proxmoxTemplateId,
            status: input.status,
          })
          .returning()
        if (!os) {
          await logAndNotify({
            action: "admin:create_operating_system",
            db: ctx.db,
            details: {
              displayName: input.displayName,
              proxmoxTemplateId: input.proxmoxTemplateId,
              status: input.status,
            },
            notifyMessage: "Failed to create operating system",
            notifyStatus: "failure",
            resourceType: "operating_system",
            userId,
          })

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create operating system",
          })
        }

        await logAndNotify({
          action: "admin:create_operating_system",
          db: ctx.db,
          details: {
            displayName: os.displayName,
            proxmoxTemplateId: os.proxmoxTemplateId,
            status: os.status,
          },
          notifyMessage: `Operating system "${os.displayName}" created`,
          notifyStatus: "success",
          resourceId: os.id,
          resourceType: "operating_system",
          userId,
        })

        return os
      }),
  }),

  template: createTRPCRouter({
    create: adminProcedure
      .input(insertVMTemplateSchema)
      .mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.session.user

        const name = input.displayName.trim().toLowerCase().replace(/\s+/g, "-")

        const [template] = await ctx.db
          .insert(vmTemplateTable)
          .values({
            cpuCores: input.cpuCores,
            description: input.description ?? null,
            diskGb: input.diskGb,
            displayName: input.displayName,
            memoryMb: input.memoryMb,
            name,
            status: input.status,
          })
          .returning()
        if (!template) {
          await logAndNotify({
            action: "admin:create_vm_template",
            db: ctx.db,
            details: {
              cpuCores: input.cpuCores,
              diskGb: input.diskGb,
              displayName: input.displayName,
              memoryMb: input.memoryMb,
              status: input.status,
            },
            notifyMessage: "Failed to create VM template",
            notifyStatus: "failure",
            resourceType: "vm_template",
            userId,
          })

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create VM template",
          })
        }

        await logAndNotify({
          action: "admin:create_vm_template",
          db: ctx.db,
          details: {
            cpuCores: template.cpuCores,
            diskGb: template.diskGb,
            displayName: template.displayName,
            memoryMb: template.memoryMb,
            status: template.status,
          },
          notifyMessage: `VM template "${template.displayName}" created`,
          notifyStatus: "success",
          resourceId: template.id,
          resourceType: "vm_template",
          userId,
        })

        return template
      }),

    update: adminProcedure
      .input(updateVMTemplateSchema.partial())
      .mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.session.user

        if (!input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Template ID is required",
          })
        }

        const [existingTemplate] = await ctx.db
          .select()
          .from(vmTemplateTable)
          .where(eq(vmTemplateTable.id, input.id))
        if (!existingTemplate) {
          await logAndNotify({
            action: "admin:update_vm_template_failed",
            db: ctx.db,
            details: {
              error: `VM Template with ID ${input.id} not found`,
            },
            notifyMessage: `Failed to update VM Template: Not found`,
            notifyStatus: "failure",
            resourceId: input.id,
            resourceType: "vm_template",
            userId,
          })

          throw new TRPCError({
            code: "NOT_FOUND",
            message: `VM Template with ID ${input.id} not found`,
          })
        }

        const updatedValues: Partial<typeof vmTemplateTable.$inferInsert> = {
          cpuCores: input.cpuCores,
          description: input.description,
          diskGb: input.diskGb,
          displayName: input.displayName,
          memoryMb: input.memoryMb,
          status: input.status,
        }

        const [updatedTemplate] = await ctx.db
          .update(vmTemplateTable)
          .set(updatedValues)
          .where(eq(vmTemplateTable.id, input.id))
          .returning()
        if (!updatedTemplate) {
          await logAndNotify({
            action: "admin:update_vm_template_failed",
            db: ctx.db,
            details: {
              error: `Failed to update VM Template with ID ${input.id}`,
            },
            notifyMessage: "Failed to update VM Template",
            notifyStatus: "failure",
            resourceId: input.id,
            resourceType: "vm_template",
            userId,
          })

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update VM Template",
          })
        }

        await logAndNotify({
          action: "admin:update_vm_template",
          db: ctx.db,
          details: {
            cpuCores: updatedTemplate.cpuCores,
            diskGb: updatedTemplate.diskGb,
            displayName: updatedTemplate.displayName,
            memoryMb: updatedTemplate.memoryMb,
            status: updatedTemplate.status,
          },
          notifyMessage: `VM Template "${updatedTemplate.displayName}" updated`,
          notifyStatus: "success",
          resourceId: updatedTemplate.id,
          resourceType: "vm_template",
          userId,
        })

        return updatedTemplate
      }),
  }),
})
