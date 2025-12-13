import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth/utils"

export async function proxy(req: NextRequest) {
  const session = await getSession(req)
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard"],
}
