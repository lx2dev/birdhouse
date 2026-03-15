import { env } from "@/env"
import type { Session } from "@/lib/auth/utils"

export function isUserAdmin(session: Session | null): boolean {
  if (!session?.user) return false

  const adminEmail = env.NEXT_PUBLIC_ADMIN_EMAIL.trim().toLowerCase()
  const userEmail = session.user.email.trim().toLowerCase()

  if (adminEmail && userEmail && adminEmail === userEmail) return true
  if (session.user.role === "admin") return true

  return false
}
