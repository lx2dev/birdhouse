import {
  adminClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  twoFactorClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { env } from "@/env"
import type { auth } from "@/server/auth"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_URL,
  plugins: [
    adminClient(),
    lastLoginMethodClient(),
    twoFactorClient(),
    inferAdditionalFields<typeof auth>(),
  ],
})

export const { signIn, signOut, useSession } = authClient
