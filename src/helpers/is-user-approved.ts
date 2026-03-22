import type { Session } from "@/lib/auth/utils"

export function isUserApproved(session: Session | null): boolean {
  if (!session?.user) return false

  return session.user.approved && session.user.emailVerified
}
