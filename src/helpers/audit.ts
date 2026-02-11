import type { db } from "@/server/db"
import type { AuditLogInsert } from "@/server/db/schema"
import { auditLog as auditLogTable } from "@/server/db/schema"

interface AuditLogEntry extends AuditLogInsert {
  ctx: {
    db: typeof db
  }
}

export async function auditLog({ ctx, ...rest }: AuditLogEntry) {
  return await ctx.db.insert(auditLogTable).values({
    ...rest,
  })
}
