import { TRPCError } from "@trpc/server"
import { count, eq } from "drizzle-orm"

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
    const [[userCount], [templateCount], [vmCount]] = await Promise.all([
      ctx.db.select({ count: count() }).from(userTable),
      ctx.db.select({ count: count() }).from(vmTemplateTable),
      ctx.db.select({ count: count() }).from(vmTable),
    ])

    return {
      templateCount,
      userCount,
      vmCount,
    }
  }),

  os: createTRPCRouter({
    create: adminProcedure
      .input(insertOperatingSystemSchema)
      .mutation(async ({ ctx, input }) => {
        const name = input.displayName.trim().toLowerCase().replace(/\s+/g, "-")

        const [template] = await ctx.db
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
        if (!template) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create VM template",
          })
        }

        return template
      }),
  }),

  template: createTRPCRouter({
    create: adminProcedure
      .input(insertVMTemplateSchema)
      .mutation(async ({ ctx, input }) => {
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
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create VM template",
          })
        }

        return template
      }),

    update: adminProcedure
      .input(updateVMTemplateSchema.partial())
      .mutation(async ({ ctx, input }) => {
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
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update VM Template",
          })
        }

        return updatedTemplate
      }),
  }),
})
