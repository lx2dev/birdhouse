import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { env } from "@/env"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_URL,
  plugins: [adminClient(), lastLoginMethodClient()],
})

export const { signIn, signOut, useSession } = authClient
