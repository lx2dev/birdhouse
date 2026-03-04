import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import z from "zod"

import {
  accountInsertSchema,
  userInsertSchema,
} from "@/modules/settings/schemas/account"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { auth } from "@/server/auth"
import { account as accoutTable, user as userTable } from "@/server/db/schema"

export const accountRouter = createTRPCRouter({
  /**
   * TODO: Fix changeEmail
   *
   * ? I don't remember what is wrong here
   */
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

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: accountInsertSchema.shape.password,
        newPassword: accountInsertSchema.shape.password,
        revokeOtherSessions: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword, revokeOtherSessions } = input

      if (!currentPassword || !newPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password and new password are required",
        })
      }

      if (currentPassword === newPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New password must be different from the current one",
        })
      }

      const { ok, status, statusText } = await auth.api.changePassword({
        asResponse: true,
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions,
        },
        headers: ctx.headers,
      })

      if (!ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to change password: ${statusText}`,
        })
      }

      return status
    }),

  disconnect: protectedProcedure
    .input(
      accountInsertSchema.pick({
        providerId: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input)

      const { ok, status, statusText } = await auth.api.unlinkAccount({
        asResponse: true,
        body: {
          providerId: input.providerId,
        },
        headers: ctx.headers,
      })

      if (!ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to disconnect account: ${statusText}`,
        })
      }

      return status
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session

    const rows = await ctx.db
      .select({
        account: accoutTable,
        profile: userTable,
      })
      .from(userTable)
      .leftJoin(accoutTable, eq(accoutTable.userId, userTable.id))
      .where(eq(userTable.id, user.id))

    const profile = rows[0]?.profile
    const accounts = rows.flatMap((row) => (row.account ? [row.account] : []))

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      })
    }

    if (!accounts) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load connected accounts",
      })
    }

    return {
      ...profile,
      accounts,
    }
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
