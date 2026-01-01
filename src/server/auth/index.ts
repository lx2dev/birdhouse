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
      console.log(`Password for user ${user.email} has been reset.`)
    },
    resetPasswordTokenExpiresIn: 60 * 5,
    async sendResetPassword({ url, user }) {
      // TODO: Use a proper email template
      void resend.emails.send({
        from: "Birdhouse <no-reply@lx2.dev>",
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}
If you did not request this, please ignore this email.
This link will expire in 5 minutes.`,
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
