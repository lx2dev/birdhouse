import type { Session } from "@/lib/auth/utils"

export function isUserApproved(session: Session | null): {
  approved: boolean
  emailVerified: boolean
} {
  if (!session?.user) {
    return {
      approved: false,
      emailVerified: false,
    }
  }

  return {
    approved: Boolean(session.user.approved),
    emailVerified: Boolean(session.user.emailVerified),
  }
}
