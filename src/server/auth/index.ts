import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"

import { env } from "@/env"
import { getRedisClient } from "@/lib/redis"
import { db } from "@/server/db"
import { user as userTable } from "@/server/db/schema"

const redis = getRedisClient()

// TODO: implement admin and roles
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
  },
  plugins: [admin(), nextCookies()],
  rateLimit: {
    storage: "secondary-storage",
  },
  secondaryStorage: {
    async delete(key) {
      await redis.del(key)
    },
    async get(key) {
      return await redis.get(key)
    },
    async set(key, value, ttl) {
      if (ttl) await redis.set(key, value, { EX: ttl })
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
