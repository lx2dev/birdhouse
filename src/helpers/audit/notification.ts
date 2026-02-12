import type { db } from "@/server/db"
import type { NotificationInsert } from "@/server/db/schema"
import { notificationTable } from "@/server/db/schema"

interface NotificationEntry extends NotificationInsert {
  db: typeof db
}

/**
 * Low-level notification insertion.
 * Prefer using `logAndNotify()` for consistency, or call directly for standalone notifications.
 */
export async function notification({ db, ...rest }: NotificationEntry) {
  return await db.insert(notificationTable).values({
    ...rest,
  })
}
