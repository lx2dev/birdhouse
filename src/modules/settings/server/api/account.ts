import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"

import {
  accountInsertSchema,
  changePasswordSchema,
  deleteAccountSchema,
  revokeSessionSchema,
  setPasswordSchema,
  twoFactorSchema,
  twoFactorVerifySchema,
  userInsertSchema,
} from "@/modules/settings/schemas/account"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { auth } from "@/server/auth"
import { account as accountTable, user as userTable } from "@/server/db/schema"

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
    .input(changePasswordSchema)
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

  deleteAccount: protectedProcedure
    .input(deleteAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const { confirmation } = input

      if (confirmation !== "DELETE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: 'You must type "DELETE" to confirm account deletion',
        })
      }

      const { ok, status, statusText } = await auth.api.deleteUser({
        asResponse: true,
        body: {
          callbackURL: "/goodbye",
        },
        headers: ctx.headers,
      })

      if (!ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete account: ${statusText}`,
        })
      }

      return status
    }),

  disableTwoFactor: protectedProcedure
    .input(twoFactorSchema)
    .mutation(async ({ ctx, input }) => {
      const { password } = input

      const { status } = await auth.api.verifyPassword({
        body: {
          password: password,
        },
        headers: ctx.headers,
      })

      if (!status) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        })
      }

      const res = await auth.api.disableTwoFactor({
        body: {
          password: password,
        },
        headers: ctx.headers,
      })

      if (!res) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable two-factor authentication",
        })
      }

      return res
    }),

  disconnect: protectedProcedure
    .input(
      accountInsertSchema.pick({
        providerId: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

  enableTwoFactor: protectedProcedure
    .input(twoFactorSchema)
    .mutation(async ({ ctx, input }) => {
      const { password } = input

      const { status } = await auth.api.verifyPassword({
        body: {
          password: password,
        },
        headers: ctx.headers,
      })

      if (!status) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        })
      }

      const res = await auth.api.enableTwoFactor({
        body: {
          password: password,
        },
        headers: ctx.headers,
      })

      if (!res) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enable two-factor authentication",
        })
      }

      return res
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session

    const [profile] = await ctx.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, user.id))
      .limit(1)

    const accounts = await ctx.db
      .select({
        accountId: accountTable.accountId,
        createdAt: accountTable.createdAt,
        id: accountTable.id,
        providerId: accountTable.providerId,
        updatedAt: accountTable.updatedAt,
        userId: accountTable.userId,
      })
      .from(accountTable)
      .where(eq(accountTable.userId, user.id))

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      })
    }

    return {
      ...profile,
      accounts,
    }
  }),

  getSecurityStatus: protectedProcedure.query(async ({ ctx }) => {
    const twoFactorEnabled = Boolean(
      (ctx.session.user as { twoFactorEnabled?: boolean } | undefined)
        ?.twoFactorEnabled,
    )

    return {
      twoFactorEnabled,
    }
  }),

  listSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await auth.api.listSessions({
      headers: ctx.headers,
    })

    if (!sessions) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list sessions",
      })
    }

    return sessions
  }),

  revokeOtherSessions: protectedProcedure.mutation(async ({ ctx }) => {
    const { ok, statusText } = await auth.api.revokeOtherSessions({
      asResponse: true,
      headers: ctx.headers,
    })

    if (!ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to revoke other sessions: ${statusText}`,
      })
    }

    return {
      status: true,
    }
  }),

  revokeSession: protectedProcedure
    .input(revokeSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { ok, statusText } = await auth.api.revokeSession({
        asResponse: true,
        body: {
          token: input.token,
        },
        headers: ctx.headers,
      })

      if (!ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to revoke session: ${statusText}`,
        })
      }

      return {
        status: true,
      }
    }),

  setPassword: protectedProcedure
    .input(setPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { newPassword } = input

      if (!newPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New password is required",
        })
      }

      const { ok, status, statusText } = await auth.api.setPassword({
        asResponse: true,
        body: {
          newPassword,
        },
        headers: ctx.headers,
      })

      if (!ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to set password: ${statusText}`,
        })
      }

      return status
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

  verifyTwoFactor: protectedProcedure
    .input(twoFactorVerifySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await auth.api.verifyTOTP({
          body: {
            code: input.code,
            trustDevice: input.trustDevice,
          },
          headers: ctx.headers,
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to verify two-factor code",
        })
      }
    }),
})
