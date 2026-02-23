import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"

import { userInsertSchema } from "@/modules/settings/schemas/account"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { auth } from "@/server/auth"
import { user as userTable } from "@/server/db/schema"

export const accountRouter = createTRPCRouter({
  // TODO: Fix changeEmail
  changeEmail: protectedProcedure
    .input(
      userInsertSchema.pick({
        email: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session

      if (input.email === user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New email address must be different from the current one",
        })
      }

      const { ok, status, statusText } = await auth.api.changeEmail({
        asResponse: true,
        body: {
          newEmail: input.email,
        },
        headers: ctx.headers,
      })

      if (!ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to change email address: ${statusText}`,
        })
      }

      return status
    }),

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
    .input(
      userInsertSchema
        .pick({
          image: true,
          name: true,
        })
        .partial(),
    )
    .mutation(async ({ ctx, input }) => {
      const { ok, status, statusText } = await auth.api.updateUser({
        asResponse: true,
        body: {
          image: input.image || undefined,
          name: input.name || undefined,
        },
        headers: ctx.headers,
      })

      if (!ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update user profile: ${statusText}`,
        })
      }

      return status
    }),
})
