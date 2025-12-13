import { TRPCError } from "@trpc/server"
import { desc, eq } from "drizzle-orm"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { vm as vmTable } from "@/server/db/schema"

export const vmRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session

    const vms = await ctx.db
      .select()
      .from(vmTable)
      .where(eq(vmTable.userId, user.id))
      .orderBy(desc(vmTable.createdAt))

    if (!vms) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No VMs found for the user.",
      })
    }

    return vms
  }),
})
