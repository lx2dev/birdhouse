import { env } from "@/env"
import { getSession } from "@/lib/auth/utils"
import { db } from "@/server/db"

export async function isUserApproved(): Promise<{
  approved: boolean
  emailVerified: boolean
}> {
  const session = await getSession()

  if (!session?.user) {
    return {
      approved: false,
      emailVerified: false,
    }
  }

  const normalizedUserEmail = session.user.email?.trim().toLowerCase()
  const protectedAdminEmail = env.NEXT_PUBLIC_ADMIN_EMAIL.trim().toLowerCase()

  if (normalizedUserEmail === protectedAdminEmail) {
    return {
      approved: true,
      emailVerified: true,
    }
  }

  try {
    const user = await db.query.user.findFirst({
      columns: {
        approved: true,
        emailVerified: true,
      },
      where: (table, { eq }) => eq(table.id, session.user.id),
    })

    if (user) {
      return {
        approved: Boolean(user.approved),
        emailVerified: Boolean(user.emailVerified),
      }
    }
  } catch {
    // Fall back to session values if DB lookup fails.
  }

  return {
    approved: Boolean(session.user.approved),
    emailVerified: Boolean(session.user.emailVerified),
  }
}
