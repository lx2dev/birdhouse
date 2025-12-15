import { and, asc, eq, lt, or } from "drizzle-orm"
import z from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { vmTemplate as vmTemplateTable } from "@/server/db/schema"

export const templateRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.cuid(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input

      const templates = await ctx.db
        .select()
        .from(vmTemplateTable)
        .where(
          and(
            eq(vmTemplateTable.status, "available"),
            cursor
              ? or(
                  lt(vmTemplateTable.createdAt, cursor.createdAt),
                  and(
                    eq(vmTemplateTable.id, cursor.id),
                    eq(vmTemplateTable.createdAt, cursor.createdAt),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(asc(vmTemplateTable.cpuCores))
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
