import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_URL: z.url(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NODE_ENV: process.env.NODE_ENV,
    PM_DEFAULT_NODE: process.env.PM_DEFAULT_NODE,
    PM_DEFAULT_POOL: process.env.PM_DEFAULT_POOL,
    PM_HOST: process.env.PM_HOST,
    PM_SECRET: process.env.PM_SECRET,
    PM_TLS_SKIP_VERIFY: process.env.PM_TLS_SKIP_VERIFY,
    PM_TOKEN_ID: process.env.PM_TOKEN_ID,
  },
  server: {
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.url(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PM_DEFAULT_NODE: z.string().default("pve01"),
    PM_DEFAULT_POOL: z.string().default("UserPool"),
    PM_HOST: z.string(),
    PM_SECRET: z.string(),
    PM_TLS_SKIP_VERIFY: z.enum(["true", "false"]).default("false"),
    PM_TOKEN_ID: z.string(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
