import { headers } from "next/headers"
import type { NextRequest } from "next/server"
import { cache } from "react"

import { auth } from "@/server/auth"

export const getSession = cache(async (req?: Pick<NextRequest, "headers">) => {
  return await auth.api.getSession(
    req
      ? req
      : {
          headers: await headers(),
        },
  )
})
