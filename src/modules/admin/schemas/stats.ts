import z from "zod"

export const adminVmStatusCountsSchema = z.object({
  deleting: z.number(),
  error: z.number(),
  provisioning: z.number(),
  rebooting: z.number(),
  running: z.number(),
  stopped: z.number(),
  suspended: z.number(),
})

export const adminCatalogStatusCountsSchema = z.object({
  available: z.number(),
  testing: z.number(),
  unavailable: z.number(),
})

export const adminRecentUserActivitySchema = z.object({
  action: z.string(),
  timestamp: z.string(),
  userId: z.string(),
  userImage: z.string().nullable(),
  userName: z.string(),
})

export const adminRecentVmActivitySchema = z.object({
  action: z.string(),
  timestamp: z.string(),
  userImage: z.string().nullable(),
  userName: z.string(),
  vmId: z.string(),
})

export const adminStatsResponseSchema = z.object({
  audit: z.object({
    last7dCount: z.number(),
    last24hCount: z.number(),
    totalCount: z.number(),
  }),
  generatedAt: z.string(),
  notifications: z.object({
    alertCount: z.number(),
    failureCount: z.number(),
    totalCount: z.number(),
    unreadAlertCount: z.number(),
    unreadCount: z.number(),
  }),
  operatingSystems: z.object({
    byStatus: adminCatalogStatusCountsSchema,
    newLast24hCount: z.number(),
    newPrev24hCount: z.number(),
    totalCount: z.number(),
  }),
  osCount: z.number(),
  pendingApprovalCount: z.number(),
  recentUserActivity: z.array(adminRecentUserActivitySchema),
  recentVmActivity: z.array(adminRecentVmActivitySchema),
  templateCount: z.number(),
  templates: z.object({
    byStatus: adminCatalogStatusCountsSchema,
    newLast24hCount: z.number(),
    newPrev24hCount: z.number(),
    totalCount: z.number(),
  }),
  userCount: z.number(),
  users: z.object({
    approvedCount: z.number(),
    bannedCount: z.number(),
    emailVerifiedCount: z.number(),
    newLast7dCount: z.number(),
    newLast24hCount: z.number(),
    newPrev24hCount: z.number(),
    pendingApprovalCount: z.number(),
    totalCount: z.number(),
    twoFactorEnabledCount: z.number(),
  }),
  vmCount: z.number(),
  vms: z.object({
    byStatus: adminVmStatusCountsSchema,
    healthyCount: z.number(),
    issueCount: z.number(),
    newLast24hCount: z.number(),
    newPrev24hCount: z.number(),
    runningCount: z.number(),
    totalCount: z.number(),
  }),
})
