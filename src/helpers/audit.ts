import type { db } from "@/server/db"
import type { AuditLogInsert } from "@/server/db/schema"
import { auditLog as auditLogTable } from "@/server/db/schema"

interface AuditLogEntry extends AuditLogInsert {
  db: typeof db
}

export async function auditLog({ db, ...rest }: AuditLogEntry) {
  return await db.insert(auditLogTable).values({
    ...rest,
  })
}
