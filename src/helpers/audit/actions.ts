/**
 * Audit action types and their corresponding detail schemas.
 * Ensures type-safe, consistent logging across the application.
 */

import z from "zod"

const computeProvisionRequestedDetails = z.object({
  template: z.string(),
  vmid: z.number(),
  vmName: z.string(),
})

const computeProvisionCompletedDetails = z.object({
  template: z.string(),
  vmid: z.number(),
  vmName: z.string(),
})

const computeProvisionFailedDetails = z.object({
  error: z.string().optional(),
  reason: z.string().optional(),
  template: z.string().optional(),
  vmid: z.number().optional(),
  vmName: z.string().optional(),
})

const computeDeleteRequestedDetails = z.object({
  vmid: z.number(),
  vmName: z.string(),
})

const computeDeletedDetails = z.object({
  vmid: z.number(),
  vmName: z.string(),
})

const computeStartedDetails = z.object({
  vmid: z.number(),
  vmName: z.string(),
})

const computeStoppedDetails = z.object({
  vmid: z.number(),
  vmName: z.string(),
})

const computeRebootedDetails = z.object({
  vmid: z.number(),
  vmName: z.string(),
})

const computeFailedDetails = z.object({
  error: z.string().optional(),
  instanceId: z.string().optional(),
  reason: z.string().optional(),
  vmid: z.number().optional(),
  vmName: z.string().optional(),
})

const sshKeyCreatedDetails = z.object({
  fingerprint: z.string(),
  keyType: z.enum(["rsa", "ed25519"]),
  name: z.string(),
})

const sshKeyDeletedDetails = z.object({
  fingerprint: z.string(),
  name: z.string(),
})

const sshKeyFailedDetails = z.object({
  fingerprint: z.string().optional(),
  keyId: z.string().optional(),
  name: z.string().optional(),
  reason: z.string().optional(),
})

const sshKeyUpdatedDetails = z.object({
  fingerprint: z.string(),
  name: z.string(),
})

const sshKeyImportedDetails = z.object({
  fingerprint: z.string(),
  name: z.string(),
})

const adminCreateOperatingSystemDetails = z.object({
  displayName: z.string(),
  proxmoxTemplateId: z.number(),
  status: z.string(),
})

const adminCreateVMTemplateDetails = z.object({
  cpuCores: z.number(),
  diskGb: z.number(),
  displayName: z.string(),
  memoryMb: z.number(),
  status: z.string(),
})

const adminDeleteVMTemplateDetails = z.object({
  displayName: z.string(),
})

const adminUpdateVMTemplateDetails = z.object({
  cpuCores: z.number().optional(),
  diskGb: z.number().optional(),
  displayName: z.string(),
  memoryMb: z.number().optional(),
  status: z.string().optional(),
})

const adminTemplateFailedDetails = z.object({
  error: z.string().optional(),
  reason: z.string().optional(),
})

const adminApproveUserDetails = z.object({
  targetUserEmail: z.string(),
  targetUserId: z.string(),
})

const adminApproveUserFailedDetails = z.object({
  error: z.string().optional(),
  reason: z.string().optional(),
  targetUserId: z.string().optional(),
})

const adminRejectUserDetails = z.object({
  reason: z.string().optional(),
  targetUserEmail: z.string(),
  targetUserId: z.string(),
})

const adminBanUserDetails = z.object({
  banExpires: z.date().optional(),
  reason: z.string().optional(),
  targetUserEmail: z.string(),
  targetUserId: z.string(),
})

const adminUnbanUserDetails = z.object({
  targetUserEmail: z.string(),
  targetUserId: z.string(),
})

const failureDetails = z.object({
  error: z.string().optional(),
  reason: z.string().optional(),
})

const notificationMarkAsReadDetails = z.object({
  notificationId: z.string(),
})

const notificationMarkAllAsReadDetails = z.object({
  userId: z.string(),
})

// Action type mapping

export const auditActionMap = {
  // Admin actions
  "admin:approve_user": adminApproveUserDetails,
  "admin:approve_user_failed": adminApproveUserFailedDetails,
  "admin:ban_user": adminBanUserDetails,
  "admin:create_operating_system": adminCreateOperatingSystemDetails,
  "admin:create_vm_template": adminCreateVMTemplateDetails,
  "admin:delete_vm_template": adminDeleteVMTemplateDetails,
  "admin:delete_vm_template_failed": adminTemplateFailedDetails,
  "admin:reject_user": adminRejectUserDetails,
  "admin:unban_user": adminUnbanUserDetails,
  "admin:update_vm_template": adminUpdateVMTemplateDetails,
  "admin:update_vm_template_failed": adminTemplateFailedDetails,

  "compute:delete_requested": computeDeleteRequestedDetails,
  "compute:deleted": computeDeletedDetails,
  "compute:deletion_failed": computeFailedDetails,
  "compute:fetch_failed": computeFailedDetails,
  "compute:fetch_status_failed": computeFailedDetails,
  "compute:provision_completed": computeProvisionCompletedDetails,
  "compute:provision_failed": computeProvisionFailedDetails,

  // Compute actions
  "compute:provision_requested": computeProvisionRequestedDetails,
  "compute:reboot_failed": computeFailedDetails,
  "compute:rebooted": computeRebootedDetails,
  "compute:shutdown_failed": computeFailedDetails,
  "compute:shutdown_initiated": computeFailedDetails,
  "compute:start_failed": computeFailedDetails,
  "compute:started": computeStartedDetails,
  "compute:stop_failed": computeFailedDetails,
  "compute:stopped": computeStoppedDetails,

  // Error/generic actions
  error: failureDetails,

  // notification actions
  "notification:mark_all_as_read": notificationMarkAllAsReadDetails,
  "notification:mark_as_read": notificationMarkAsReadDetails,

  // SSH key actions
  "sshkey:create": sshKeyCreatedDetails,
  "sshkey:create_failed": sshKeyFailedDetails,
  "sshkey:delete": sshKeyDeletedDetails,
  "sshkey:delete_failed": sshKeyFailedDetails,
  "sshkey:import": sshKeyImportedDetails,
  "sshkey:update": sshKeyUpdatedDetails,
  "sshkey:update_failed": sshKeyFailedDetails,
} as const

export type AuditActionType = keyof typeof auditActionMap
export type AuditActionDetails<T extends AuditActionType> = z.infer<
  (typeof auditActionMap)[T]
>

/**
 * Validate audit action and details
 */
export function validateAuditAction<T extends AuditActionType>(
  action: T,
  details: unknown,
) {
  const schema = auditActionMap[action]
  if (!schema) {
    throw new Error(`Unknown audit action: ${action}`)
  }
  return schema.parse(details)
}

/**
 * Type-safe audit action builder
 */
export function createAuditPayload<T extends AuditActionType>(
  action: T,
  details: AuditActionDetails<T>,
) {
  return {
    action,
    details: validateAuditAction(action, details),
  } as const
}
