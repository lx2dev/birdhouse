import { env } from "@/env"
import type { auth } from "@/server/auth"

export function isUserAdmin(
  session: typeof auth.$Infer.Session | null,
): boolean {
  if (!session?.user) return false

  const adminEmail = env.ADMIN_EMAIL
  const userEmail = session.user.email

  if (adminEmail && userEmail && adminEmail === userEmail) return true
  if (session.user.role === "admin") return true

  return false
}
