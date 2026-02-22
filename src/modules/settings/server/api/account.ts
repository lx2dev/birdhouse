import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"

import { userInsertSchema } from "@/modules/settings/schemas/account"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { user as userTable } from "@/server/db/schema"

export const accountRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session

    const profile = await ctx.db.query.user.findFirst({
      where: eq(userTable.id, user.id),
    })

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      })
    }

    return profile
  }),

  updateProfile: protectedProcedure
    .input(userInsertSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session

      const [updatedUser] = await ctx.db
        .update(userTable)
        .set(input)
        .where(eq(userTable.id, user.id))
        .returning()

      return updatedUser
    }),
})
