import type { db } from "@/server/db"
import type { AuditLogInsert } from "@/server/db/schema"
import { auditLog as auditLogTable } from "@/server/db/schema"

interface AuditLogEntry extends AuditLogInsert {
  db: typeof db
}

/**
 * Low-level audit log insertion.
 * Prefer using `logAndNotify()` or `logOnly()` for consistency.
 *
 * This is a simple passthrough that accepts raw details (already validated).
 */
export async function auditLog({ db, ...rest }: AuditLogEntry) {
  return await db.insert(auditLogTable).values({
    ...rest,
  })
}
