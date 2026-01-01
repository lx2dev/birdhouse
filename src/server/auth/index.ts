import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"

import { env } from "@/env"
import { getRedisClient } from "@/lib/redis"
import { resend } from "@/lib/resend"
import { db } from "@/server/db"
import { user as userTable } from "@/server/db/schema"

export const auth = betterAuth({
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
    enabled: true,
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
            TIME_OF_RESET: timeOfReset,
            USER_NAME: user.name,
            YEAR: year,
          },
        },
        to: user.email,
      })
    },
    resetPasswordTokenExpiresIn: 60 * 10,
    async sendResetPassword({ url, user }) {
      const year = new Date().getFullYear()

      void resend.emails.send({
        from: "Birdhouse <no-reply@lx2.dev>",
        subject: "Reset your password",
        template: {
          id: "reset-password",
          variables: {
            RESET_URL: url,
            USER_NAME: user.name,
            YEAR: year,
          },
        },
        to: user.email,
      })
    },
  },
  plugins: [admin(), nextCookies()],
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
  socialProviders: {
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
})
