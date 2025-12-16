import { and, asc, eq, lt, or } from "drizzle-orm"
import z from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { operatingSystem as osTable } from "@/server/db/schema"

export const osRouter = createTRPCRouter({
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
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input

      const osList = await ctx.db
        .select()
        .from(osTable)
        .where(
          and(
            eq(osTable.status, "available"),
            cursor
              ? or(
                  lt(osTable.createdAt, cursor.createdAt),
                  and(
                    eq(osTable.id, cursor.id),
                    eq(osTable.createdAt, cursor.createdAt),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(asc(osTable.createdAt))
        .limit(limit + 1)

      const hasMore = osList.length > limit
      const items = hasMore ? osList.slice(0, -1) : osList
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
