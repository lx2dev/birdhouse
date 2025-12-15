import { desc, eq } from "drizzle-orm"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { sshKey as sshKeyTable } from "@/server/db/schema"

export const sshKeyRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session

    const sshKeys = await ctx.db
      .select()
      .from(sshKeyTable)
      .where(eq(sshKeyTable.userId, user.id))
      .orderBy(desc(sshKeyTable.createdAt))

    return sshKeys
  }),
})
