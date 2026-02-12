import { and, desc, eq, lt, or } from "drizzle-orm"
import z from "zod"

import { logOnly } from "@/helpers/audit/log-and-notify"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { notificationTable } from "@/server/db/schema"

export const notificationRouter = createTRPCRouter({
  archive: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      logOnly({
        action: "notification:mark_as_read",
        db: ctx.db,
        details: {
          notificationId: id,
        },
        resourceId: id,
        resourceType: "notification",
        userId: user.id,
      })

      await ctx.db
        .update(notificationTable)
        .set({ read: true })
        .where(
          and(
            eq(notificationTable.id, id),
            eq(notificationTable.userId, user.id),
          ),
        )
    }),

  archiveAll: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session

    logOnly({
      action: "notification:mark_all_as_read",
      db: ctx.db,
      details: {
        userId: user.id,
      },
      resourceId: user.id,
      resourceType: "user",
      userId: user.id,
    })

    await ctx.db
      .update(notificationTable)
      .set({ read: true })
      .where(eq(notificationTable.userId, user.id))
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

      const notifications = await ctx.db
        .select()
        .from(notificationTable)
        .where(
          and(
            eq(notificationTable.userId, user.id),
            cursor
              ? or(
                  lt(notificationTable.createdAt, cursor.createdAt),
                  and(
                    eq(notificationTable.id, cursor.id),
                    eq(notificationTable.createdAt, cursor.createdAt),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(notificationTable.createdAt), desc(notificationTable.id))
        .limit(limit + 1)

      const hasMore = notifications.length > limit
      const items = hasMore ? notifications.slice(0, -1) : notifications
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
