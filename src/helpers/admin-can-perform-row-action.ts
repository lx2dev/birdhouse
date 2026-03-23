import { env } from "@/env"

interface AdminCanPerformRowActionInput {
  currentUserId: string | null | undefined
  targetUserId: string
  targetUserEmail: string
  targetUserRole: string | null | undefined
}

export function adminCanPerformRowAction({
  currentUserId,
  targetUserId,
  targetUserEmail,
  targetUserRole,
}: AdminCanPerformRowActionInput): boolean {
  const isSelf = Boolean(currentUserId && currentUserId === targetUserId)
  if (isSelf) return false

  const protectedAdminEmail = env.NEXT_PUBLIC_ADMIN_EMAIL.trim().toLowerCase()
  const normalizedTargetEmail = targetUserEmail.trim().toLowerCase()
  if (normalizedTargetEmail === protectedAdminEmail) return false

  const isTargetAdmin = targetUserRole === "admin"
  if (isTargetAdmin) return false

  return true
}
