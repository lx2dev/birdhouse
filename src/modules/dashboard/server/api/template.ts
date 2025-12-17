import { and, asc, desc, eq, lt, or } from "drizzle-orm"
import z from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import {
  vmTemplateStatusEnum,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"

export const templateRouter = createTRPCRouter({
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
})
