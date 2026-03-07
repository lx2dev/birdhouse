import { APIError, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin, lastLoginMethod } from "better-auth/plugins"

import { TRUSTED_SOCIAL_PROVIDERS } from "@/constants"
import { env } from "@/env"
import { getRedisClient } from "@/lib/redis"
import { resend } from "@/lib/resend"
import { db } from "@/server/db"
import { user as userTable } from "@/server/db/schema"

export const auth = betterAuth({
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      enabled: true,
      trustedProviders: [...TRUSTED_SOCIAL_PROVIDERS],
    },
    encryptOAuthTokens: true,
  },
  appName: "Birdhouse",
  baseURL: env.NEXT_PUBLIC_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {
    user: {
      create: {
        async after() {
          const users = await db.$count(userTable)
          if (users === 1) {
            await db.update(userTable).set({
              approved: true,
              emailVerified: true,
              role: "admin",
            })
          }
        },
      },
    },
  },
  emailAndPassword: {
    autoSignIn: true,
    enabled: true,
    minPasswordLength: 12,
    async onPasswordReset({ user }) {
      const year = new Date().getFullYear()
      const timeOfReset = new Date().toLocaleString("en-US", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        second: "2-digit",
        year: "numeric",
      })

      void resend.emails.send({
        from: "Birdhouse <no-reply@lx2.dev>",
        subject: "Your password has been reset",
        template: {
          id: "after-reset-password",
          variables: {
            SITE_URL: env.NEXT_PUBLIC_URL,
            SUPPORT_URL: `${env.NEXT_PUBLIC_URL}/support`,
            TIME_OF_RESET: timeOfReset,
            USER_NAME: user.name,
            YEAR: year,
          },
        },
        to: user.email,
      })
    },
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 10,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ url, user }) {
      const year = new Date().getFullYear()

      void resend.emails.send({
        from: "Birdhouse <no-reply@lx2.dev>",
        subject: "Reset your password",
        template: {
          id: "reset-password",
          variables: {
            RESET_URL: url,
            SUPPORT_URL: `${env.NEXT_PUBLIC_URL}/support`,
            USER_NAME: user.name,
            YEAR: year,
          },
        },
        to: user.email,
      })
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }) {
      const year = new Date().getFullYear()

      void resend.emails.send({
        from: "Birdhouse <no-reply@lx2.dev>",
        subject: "Verify your email address",
        template: {
          id: "verify-email",
          variables: {
            SUPPORT_URL: `${env.NEXT_PUBLIC_URL}/support`,
            USER_NAME: user.name,
            VERIFICATION_URL: url,
            YEAR: year,
          },
        },
        to: user.email,
      })
    },
  },
  plugins: [admin(), lastLoginMethod(), nextCookies()],
  rateLimit: {
    storage: "secondary-storage",
  },
  secondaryStorage: {
    async delete(key) {
      const redis = getRedisClient()
      await redis.del(key)
    },
    async get(key) {
      const redis = getRedisClient()
      return await redis.get(key)
    },
    async set(key, value, ttl) {
      const redis = getRedisClient()
      if (ttl)
        await redis.set(key, value, {
          expiration: {
            type: "EX",
            value: ttl,
          },
        })
      else await redis.set(key, value)
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: {
    ...Object.fromEntries(
      TRUSTED_SOCIAL_PROVIDERS.map((provider) => [
        provider,
        {
          clientId:
            env[`${provider.toUpperCase()}_CLIENT_ID` as keyof typeof env],
          clientSecret:
            env[`${provider.toUpperCase()}_CLIENT_SECRET` as keyof typeof env],
          enabled: true,
        },
      ]),
    ),
  },
  user: {
    changeEmail: {
      enabled: true,
      async sendChangeEmailConfirmation({ user, newEmail, url }) {
        const year = new Date().getFullYear()
        const timeOfChange = new Date().toLocaleString("en-US", {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          second: "2-digit",
          year: "numeric",
        })

        void resend.emails.send({
          from: "Birdhouse <no-reply@lx2.dev>",
          subject: "Your email change request",
          template: {
            id: "confirm-email-change",
            variables: {
              CONFIRMATION_URL: url,
              NEW_EMAIL: newEmail,
              SUPPORT_URL: `${env.NEXT_PUBLIC_URL}/support`,
              TIME_OF_CHANGE: timeOfChange,
              USER_NAME: user.name,
              YEAR: year,
            },
          },
          to: user.email,
        })
      },
      updateEmailWithoutVerification: true,
    },
    deleteUser: {
      async afterDelete(user) {
        /**
         * TODO: Perform additional cleanup after account deletion
         * ? e.g. delete owned resources, transfer ownership?, etc.
         */

        const year = new Date().getFullYear()
        const timeOfChange = new Date().toLocaleString("en-US", {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          second: "2-digit",
          year: "numeric",
        })

        void resend.emails.send({
          from: "Birdhouse <no-reply@lx2.dev>",
          subject: "Your account has been deleted",
          template: {
            id: "after-account-deletion",
            variables: {
              SUPPORT_URL: `${env.NEXT_PUBLIC_URL}/support`,
              TIME_OF_CHANGE: timeOfChange,
              USER_NAME: user.name,
              YEAR: year,
            },
          },
          to: user.email,
        })
      },
      async beforeDelete(user) {
        if (user.email === env.NEXT_PUBLIC_ADMIN_EMAIL) {
          throw new APIError("BAD_REQUEST", {
            message: "The admin account cannot be deleted",
          })
        }

        /**
         * TODO: Perform additional checks
         * ? e.g. if the user has pending actions, owns resources, etc. and either prevent deletion or perform cleanup.
         */
      },
      deleteTokenExpiresIn: 60 * 10,
      enabled: true,
      async sendDeleteAccountVerification({ user, url }) {
        const year = new Date().getFullYear()
        const timeOfChange = new Date().toLocaleString("en-US", {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          second: "2-digit",
          year: "numeric",
        })

        void resend.emails.send({
          from: "Birdhouse <no-reply@lx2.dev>",
          subject: "Confirm your account deletion",
          template: {
            id: "confirm-account-deletion",
            variables: {
              CONFIRMATION_URL: url,
              SUPPORT_URL: `${env.NEXT_PUBLIC_URL}/support`,
              TIME_OF_CHANGE: timeOfChange,
              USER_NAME: user.name,
              YEAR: year,
            },
          },
          to: user.email,
        })
      },
    },
  },
})
