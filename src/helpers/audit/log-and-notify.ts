import type { db } from "@/server/db"

import type { AuditActionDetails, AuditActionType } from "./actions"
import { auditLog } from "./index"
import { notification } from "./notification"

interface LogAndNotifyParams<T extends AuditActionType> {
  db: typeof db
  action: T
  details: AuditActionDetails<T>
  userId: string
  resourceId?: string
  resourceType: string
  ipAddress?: string
  notifyMessage: string
  notifyStatus: "success" | "failure" | "alert" | "info"
  notifyUserId?: string
}

/**
 * Log an audit event and send a notification.
 * Designed for best-effort logging: if logging fails, the main operation
 * continues but the failure is logged to console.
 *
 * @example
 * ```ts
 * await logAndNotify({
 *   db,
 *   action: 'compute:provision_requested',
 *   details: { template, vmid, vmName },
 *   userId: user.id,
 *   resourceId: vm.id,
 *   resourceType: 'virtual_machine',
 *   notifyMessage: `Provisioning started for "${vmName}"`,
 *   notifyStatus: 'info',
 * })
 * ```
 */
export async function logAndNotify<T extends AuditActionType>({
  db,
  action,
  details,
  userId,
  resourceId,
  resourceType,
  ipAddress,
  notifyMessage,
  notifyStatus,
  notifyUserId = userId,
}: LogAndNotifyParams<T>) {
  // Attempt to log the audit event (best-effort)
  try {
    await auditLog({
      action,
      db,
      details,
      ipAddress,
      resourceId,
      resourceType,
      userId,
    })
  } catch (err) {
    console.error(
      `[audit] Failed to log action '${action}' for user ${userId}:`,
      err,
    )
    // Don't throw—allow main operation to continue
  }

  // Attempt to send notification (best-effort)
  try {
    await notification({
      db,
      message: notifyMessage,
      status: notifyStatus,
      userId: notifyUserId,
    })
  } catch (err) {
    console.error(
      `[notification] Failed to notify user ${notifyUserId} for action '${action}':`,
      err,
    )
    // Don't throw—allow main operation to continue
  }
}

/**
 * Log an audit event without notification.
 * Useful for internal/admin-only events.
 *
 * @example
 * ```ts
 * await logOnly({
 *   db,
 *   action: 'admin:approve_user',
 *   details: { targetUserId, targetUserEmail },
 *   userId: adminUser.id,
 *   resourceId: targetUserId,
 *   resourceType: 'user',
 * })
 * ```
 */
export async function logOnly<T extends AuditActionType>({
  db,
  action,
  details,
  userId,
  resourceId,
  resourceType,
  ipAddress,
}: Omit<
  LogAndNotifyParams<T>,
  "notifyMessage" | "notifyStatus" | "notifyUserId"
>) {
  try {
    await auditLog({
      action,
      db,
      details,
      ipAddress,
      resourceId,
      resourceType,
      userId,
    })
  } catch (err) {
    console.error(
      `[audit] Failed to log action '${action}' for user ${userId}:`,
      err,
    )
    // Don't throw
  }
}
