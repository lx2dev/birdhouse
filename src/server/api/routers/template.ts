import { TRPCError } from "@trpc/server"
import { and, asc, desc, eq, lt, or } from "drizzle-orm"
import z from "zod"

import {
  insertVMTemplateSchema,
  updateVMTemplateSchema,
} from "@/modules/admin/schemas"
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/init"
import {
  vmTemplateStatusEnum,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"

export const templateRouter = createTRPCRouter({
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
        sortBy: z
          .enum([
            "displayName",
            "name",
            "cpuCores",
            "memoryMb",
            "diskGb",
            "createdAt",
          ])
          .optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        status: z.enum(["any", ...vmTemplateStatusEnum.enumValues]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, status = "available", sortBy, sortOrder } = input

      const cursorCondition =
        cursor && (!sortBy || sortBy === "createdAt")
          ? or(
              lt(vmTemplateTable.createdAt, cursor.createdAt),
              and(
                eq(vmTemplateTable.id, cursor.id),
                eq(vmTemplateTable.createdAt, cursor.createdAt),
              ),
            )
          : undefined

      const templates = await ctx.db
        .select()
        .from(vmTemplateTable)
        .where(
          and(
            status !== "any" ? eq(vmTemplateTable.status, status) : undefined,
            cursorCondition,
          ),
        )
        .orderBy(
          (() => {
            if (!sortBy) return asc(vmTemplateTable.cpuCores)
            const field = vmTemplateTable[sortBy]
            return sortOrder === "desc" ? desc(field) : asc(field)
          })(),
        )
        .limit(limit + 1)

      const hasMore = templates.length > limit
      const items = hasMore ? templates.slice(0, -1) : templates
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

  update: adminProcedure
    .input(updateVMTemplateSchema)
    .mutation(async ({ ctx, input }) => {
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
})
