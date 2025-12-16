import { TRPCError } from "@trpc/server"
import { and, asc, eq, lt, or } from "drizzle-orm"
import z from "zod"

import { insertOperatingSystemSchema } from "@/modules/admin/schemas"
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/init"
import { operatingSystem as osTable } from "@/server/db/schema"

export const osRouter = createTRPCRouter({
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
