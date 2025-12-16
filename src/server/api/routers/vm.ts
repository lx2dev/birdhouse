import { and, desc, eq, lt, or } from "drizzle-orm"
import z from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { vm as vmTable } from "@/server/db/schema"

export const vmRouter = createTRPCRouter({
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
