import { TRPCError } from "@trpc/server"
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  lt,
  or,
  sql,
} from "drizzle-orm"
import z from "zod"

import { logAndNotify, logOnly } from "@/helpers/audit/log-and-notify"
import { getRedisClient } from "@/lib/redis"
import {
  insertOperatingSystemSchema,
  insertVMTemplateSchema,
  updateVMTemplateSchema,
} from "@/modules/admin/schemas"
import { adminStatsResponseSchema } from "@/modules/admin/schemas/stats"
import { adminProcedure, createTRPCRouter } from "@/server/api/init"
import {
  auditLog,
  notificationTable,
  operatingSystem as osTable,
  user as userTable,
  vm as vmTable,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"

const ADMIN_STATS_CACHE_KEY = "admin:getStats:v2"
const ADMIN_STATS_CACHE_TTL_SECONDS = 15
const ADMIN_RECENT_ACTIVITY_LIMIT = 12

type AdminStatsResponse = z.infer<typeof adminStatsResponseSchema>

export const adminRouter = createTRPCRouter({
  getRecentActivity: adminProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.string(),
          })
          .nullish(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input

      const rows = await ctx.db
        .select({
          action: auditLog.action,
          id: auditLog.id,
          resourceId: auditLog.resourceId,
          resourceType: auditLog.resourceType,
          timestamp: auditLog.createdAt,
          userImage: userTable.image,
          userName: userTable.name,
        })
        .from(auditLog)
        .innerJoin(userTable, eq(auditLog.userId, userTable.id))
        .where(
          cursor
            ? or(
                lt(auditLog.createdAt, cursor.createdAt),
                and(
                  eq(auditLog.createdAt, cursor.createdAt),
                  lt(auditLog.id, cursor.id),
                ),
              )
            : undefined,
        )
        .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
        .limit(limit + 1)

      const hasMore = rows.length > limit
      const items = hasMore ? rows.slice(0, -1) : rows
      const lastItem = items[items.length - 1]
      const nextCursor =
        hasMore && lastItem
          ? { createdAt: lastItem.timestamp, id: lastItem.id }
          : null

      return {
        items: items.map((row) => ({
          action: row.action,
          id: row.id,
          resourceId: row.resourceId,
          resourceType: row.resourceType,
          timestamp:
            row.timestamp instanceof Date
              ? row.timestamp.toISOString()
              : new Date(row.timestamp).toISOString(),
          userImage: row.userImage,
          userName: row.userName,
        })),
        nextCursor,
      }
    }),

  getStats: adminProcedure
    .output(adminStatsResponseSchema)
    .query(async ({ ctx }) => {
      const redis = getRedisClient()

      try {
        const cached = await redis.get(ADMIN_STATS_CACHE_KEY)
        if (cached) {
          const parsedCached = adminStatsResponseSchema.safeParse(
            JSON.parse(cached),
          )

          if (parsedCached.success) {
            return parsedCached.data
          }
        }
      } catch {
        // Ignore cache errors and continue with database fallback.
      }

      const now = new Date()

      const [
        [userStats],
        [vmStats],
        [templateStats],
        [osStats],
        [notificationStats],
        [auditStats],
      ] = await Promise.all([
        ctx.db
          .select({
            approvedCount: sql<number>`count(*) filter (where ${userTable.approved} = true)`,
            bannedCount: sql<number>`count(*) filter (where ${userTable.banned} = true)`,
            emailVerifiedCount: sql<number>`count(*) filter (where ${userTable.emailVerified} = true)`,
            newLast7dCount: sql<number>`count(*) filter (where ${userTable.createdAt} >= now() - interval '7 days')`,
            newLast24hCount: sql<number>`count(*) filter (where ${userTable.createdAt} >= now() - interval '24 hours')`,
            newPrev24hCount: sql<number>`count(*) filter (where ${userTable.createdAt} >= now() - interval '48 hours' and ${userTable.createdAt} < now() - interval '24 hours')`,
            pendingApprovalCount: sql<number>`count(*) filter (where ${userTable.approved} = false)`,
            totalCount: sql<number>`count(*)`,
            twoFactorEnabledCount: sql<number>`count(*) filter (where ${userTable.twoFactorEnabled} = true)`,
          })
          .from(userTable),
        ctx.db
          .select({
            deletingCount: sql<number>`count(*) filter (where ${vmTable.status} = 'deleting')`,
            errorCount: sql<number>`count(*) filter (where ${vmTable.status} = 'error')`,
            newLast24hCount: sql<number>`count(*) filter (where ${vmTable.createdAt} >= now() - interval '24 hours')`,
            newPrev24hCount: sql<number>`count(*) filter (where ${vmTable.createdAt} >= now() - interval '48 hours' and ${vmTable.createdAt} < now() - interval '24 hours')`,
            provisioningCount: sql<number>`count(*) filter (where ${vmTable.status} = 'provisioning')`,
            rebootingCount: sql<number>`count(*) filter (where ${vmTable.status} = 'rebooting')`,
            runningCount: sql<number>`count(*) filter (where ${vmTable.status} = 'running')`,
            stoppedCount: sql<number>`count(*) filter (where ${vmTable.status} = 'stopped')`,
            suspendedCount: sql<number>`count(*) filter (where ${vmTable.status} = 'suspended')`,
            totalCount: sql<number>`count(*)`,
          })
          .from(vmTable),
        ctx.db
          .select({
            availableCount: sql<number>`count(*) filter (where ${vmTemplateTable.status} = 'available')`,
            newLast24hCount: sql<number>`count(*) filter (where ${vmTemplateTable.createdAt} >= now() - interval '24 hours')`,
            newPrev24hCount: sql<number>`count(*) filter (where ${vmTemplateTable.createdAt} >= now() - interval '48 hours' and ${vmTemplateTable.createdAt} < now() - interval '24 hours')`,
            testingCount: sql<number>`count(*) filter (where ${vmTemplateTable.status} = 'testing')`,
            totalCount: sql<number>`count(*)`,
            unavailableCount: sql<number>`count(*) filter (where ${vmTemplateTable.status} = 'unavailable')`,
          })
          .from(vmTemplateTable),
        ctx.db
          .select({
            availableCount: sql<number>`count(*) filter (where ${osTable.status} = 'available')`,
            newLast24hCount: sql<number>`count(*) filter (where ${osTable.createdAt} >= now() - interval '24 hours')`,
            newPrev24hCount: sql<number>`count(*) filter (where ${osTable.createdAt} >= now() - interval '48 hours' and ${osTable.createdAt} < now() - interval '24 hours')`,
            testingCount: sql<number>`count(*) filter (where ${osTable.status} = 'testing')`,
            totalCount: sql<number>`count(*)`,
            unavailableCount: sql<number>`count(*) filter (where ${osTable.status} = 'unavailable')`,
          })
          .from(osTable),
        ctx.db
          .select({
            alertCount: sql<number>`count(*) filter (where ${notificationTable.status} = 'alert')`,
            failureCount: sql<number>`count(*) filter (where ${notificationTable.status} = 'failure')`,
            totalCount: sql<number>`count(*)`,
            unreadAlertCount: sql<number>`count(*) filter (where ${notificationTable.read} = false and ${notificationTable.status} = 'alert')`,
            unreadCount: sql<number>`count(*) filter (where ${notificationTable.read} = false)`,
          })
          .from(notificationTable),
        ctx.db
          .select({
            last7dCount: sql<number>`count(*) filter (where ${auditLog.createdAt} >= now() - interval '7 days')`,
            last24hCount: sql<number>`count(*) filter (where ${auditLog.createdAt} >= now() - interval '24 hours')`,
            totalCount: sql<number>`count(*)`,
          })
          .from(auditLog),
        ctx.db
          .select({
            action: auditLog.action,
            timestamp: auditLog.createdAt,
            userId: auditLog.userId,
            userImage: userTable.image,
            userName: userTable.name,
          })
          .from(auditLog)
          .innerJoin(userTable, eq(auditLog.userId, userTable.id))
          .orderBy(desc(auditLog.createdAt))
          .limit(ADMIN_RECENT_ACTIVITY_LIMIT),
        ctx.db
          .select({
            action: auditLog.action,
            timestamp: auditLog.createdAt,
            userImage: userTable.image,
            userName: userTable.name,
            vmId: auditLog.resourceId,
          })
          .from(auditLog)
          .innerJoin(userTable, eq(auditLog.userId, userTable.id))
          .where(
            inArray(auditLog.resourceType, [
              "operating_system",
              "virtual_machine",
              "vm_template",
            ]),
          )
          .orderBy(desc(auditLog.createdAt))
          .limit(ADMIN_RECENT_ACTIVITY_LIMIT),
      ])

      const totalUsers = Number(userStats?.totalCount ?? 0)
      const pendingUsers = Number(userStats?.pendingApprovalCount ?? 0)

      const vmByStatus = {
        deleting: Number(vmStats?.deletingCount ?? 0),
        error: Number(vmStats?.errorCount ?? 0),
        provisioning: Number(vmStats?.provisioningCount ?? 0),
        rebooting: Number(vmStats?.rebootingCount ?? 0),
        running: Number(vmStats?.runningCount ?? 0),
        stopped: Number(vmStats?.stoppedCount ?? 0),
        suspended: Number(vmStats?.suspendedCount ?? 0),
      }

      const templateByStatus = {
        available: Number(templateStats?.availableCount ?? 0),
        testing: Number(templateStats?.testingCount ?? 0),
        unavailable: Number(templateStats?.unavailableCount ?? 0),
      }

      const osByStatus = {
        available: Number(osStats?.availableCount ?? 0),
        testing: Number(osStats?.testingCount ?? 0),
        unavailable: Number(osStats?.unavailableCount ?? 0),
      }

      const totalVms = Number(vmStats?.totalCount ?? 0)
      const totalTemplates = Number(templateStats?.totalCount ?? 0)
      const totalOs = Number(osStats?.totalCount ?? 0)
      const totalNotifications = Number(notificationStats?.totalCount ?? 0)
      const unreadNotifications = Number(notificationStats?.unreadCount ?? 0)
      const alertNotifications = Number(notificationStats?.alertCount ?? 0)
      const failureNotifications = Number(notificationStats?.failureCount ?? 0)
      const unreadAlertNotifications = Number(
        notificationStats?.unreadAlertCount ?? 0,
      )

      const response = {
        audit: {
          last7dCount: Number(auditStats?.last7dCount ?? 0),
          last24hCount: Number(auditStats?.last24hCount ?? 0),
          totalCount: Number(auditStats?.totalCount ?? 0),
        },
        generatedAt: now.toISOString(),
        notifications: {
          alertCount: alertNotifications,
          failureCount: failureNotifications,
          totalCount: totalNotifications,
          unreadAlertCount: unreadAlertNotifications,
          unreadCount: unreadNotifications,
        },
        operatingSystems: {
          byStatus: osByStatus,
          newLast24hCount: Number(osStats?.newLast24hCount ?? 0),
          newPrev24hCount: Number(osStats?.newPrev24hCount ?? 0),
          totalCount: totalOs,
        },
        osCount: totalOs,
        pendingApprovalCount: pendingUsers,
        templateCount: totalTemplates,
        templates: {
          byStatus: templateByStatus,
          newLast24hCount: Number(templateStats?.newLast24hCount ?? 0),
          newPrev24hCount: Number(templateStats?.newPrev24hCount ?? 0),
          totalCount: totalTemplates,
        },
        userCount: totalUsers,
        users: {
          approvedCount: Number(userStats?.approvedCount ?? 0),
          bannedCount: Number(userStats?.bannedCount ?? 0),
          emailVerifiedCount: Number(userStats?.emailVerifiedCount ?? 0),
          newLast7dCount: Number(userStats?.newLast7dCount ?? 0),
          newLast24hCount: Number(userStats?.newLast24hCount ?? 0),
          newPrev24hCount: Number(userStats?.newPrev24hCount ?? 0),
          pendingApprovalCount: pendingUsers,
          totalCount: totalUsers,
          twoFactorEnabledCount: Number(userStats?.twoFactorEnabledCount ?? 0),
        },
        vmCount: totalVms,
        vms: {
          byStatus: vmByStatus,
          healthyCount:
            vmByStatus.running + vmByStatus.stopped + vmByStatus.suspended,
          issueCount: vmByStatus.error + vmByStatus.deleting,
          newLast24hCount: Number(vmStats?.newLast24hCount ?? 0),
          newPrev24hCount: Number(vmStats?.newPrev24hCount ?? 0),
          runningCount: vmByStatus.running,
          totalCount: totalVms,
        },
      } satisfies AdminStatsResponse

      void redis
        .set(ADMIN_STATS_CACHE_KEY, JSON.stringify(response), {
          EX: ADMIN_STATS_CACHE_TTL_SECONDS,
        })
        .catch(() => {
          // Cache write failures should never fail this request.
        })

      return response
    }),

  os: createTRPCRouter({
    create: adminProcedure
      .input(insertOperatingSystemSchema)
      .mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.session.user

        const name = input.displayName.trim().toLowerCase().replace(/\s+/g, "-")

        const [os] = await ctx.db
          .insert(osTable)
          .values({
            displayName: input.displayName,
            name,
            osType: input.osType,
            osVersion: input.osVersion,
            proxmoxTemplateId: input.proxmoxTemplateId,
            status: input.status,
          })
          .returning()

        if (!os) {
          await logOnly({
            action: "admin:create_operating_system",
            db: ctx.db,
            details: {
              displayName: input.displayName,
              proxmoxTemplateId: input.proxmoxTemplateId,
              status: input.status,
            },
            resourceType: "operating_system",
            userId,
          })

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create operating system",
          })
        }

        await logAndNotify({
          action: "admin:create_operating_system",
          db: ctx.db,
          details: {
            displayName: os.displayName,
            proxmoxTemplateId: os.proxmoxTemplateId,
            status: os.status,
          },
          notifyMessage: `Operating system "${os.displayName}" created`,
          notifyStatus: "success",
          resourceId: os.id,
          resourceType: "operating_system",
          userId,
        })

        return os
      }),
  }),

  template: createTRPCRouter({
    create: adminProcedure
      .input(insertVMTemplateSchema)
      .mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.session.user

        const name = input.displayName.trim().toLowerCase().replace(/\s+/g, "-")

        const [template] = await ctx.db
          .insert(vmTemplateTable)
          .values({
            cpuCores: input.cpuCores,
            description: input.description ?? null,
            diskGb: input.diskGb,
            displayName: input.displayName,
            memoryMb: input.memoryMb,
            name,
            status: input.status,
          })
          .returning()

        if (!template) {
          await logOnly({
            action: "admin:create_vm_template",
            db: ctx.db,
            details: {
              cpuCores: input.cpuCores,
              diskGb: input.diskGb,
              displayName: input.displayName,
              memoryMb: input.memoryMb,
              status: input.status,
            },
            resourceType: "vm_template",
            userId,
          })

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create VM template",
          })
        }

        await logAndNotify({
          action: "admin:create_vm_template",
          db: ctx.db,
          details: {
            cpuCores: template.cpuCores,
            diskGb: template.diskGb,
            displayName: template.displayName,
            memoryMb: template.memoryMb,
            status: template.status,
          },
          notifyMessage: `VM template "${template.displayName}" created`,
          notifyStatus: "success",
          resourceId: template.id,
          resourceType: "vm_template",
          userId,
        })

        return template
      }),

    delete: adminProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.session.user

        const [existingTemplate] = await ctx.db
          .select()
          .from(vmTemplateTable)
          .where(eq(vmTemplateTable.id, input.id))

        if (!existingTemplate) {
          await logOnly({
            action: "admin:delete_vm_template_failed",
            db: ctx.db,
            details: {
              error: `VM Template with ID ${input.id} not found`,
            },
            resourceId: input.id,
            resourceType: "vm_template",
            userId,
          })

          throw new TRPCError({
            code: "NOT_FOUND",
            message: `VM Template with ID ${input.id} not found`,
          })
        }

        await ctx.db
          .delete(vmTemplateTable)
          .where(eq(vmTemplateTable.id, input.id))

        await logAndNotify({
          action: "admin:delete_vm_template",
          db: ctx.db,
          details: {
            displayName: existingTemplate.displayName,
          },
          notifyMessage: `VM Template "${existingTemplate.displayName}" deleted`,
          notifyStatus: "alert",
          resourceId: existingTemplate.id,
          resourceType: "vm_template",
          userId,
        })

        return { success: true }
      }),

    update: adminProcedure
      .input(updateVMTemplateSchema.partial())
      .mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.session.user

        if (!input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Template ID is required",
          })
        }

        const [existingTemplate] = await ctx.db
          .select()
          .from(vmTemplateTable)
          .where(eq(vmTemplateTable.id, input.id))

        if (!existingTemplate) {
          await logOnly({
            action: "admin:update_vm_template_failed",
            db: ctx.db,
            details: {
              error: `VM Template with ID ${input.id} not found`,
            },
            resourceId: input.id,
            resourceType: "vm_template",
            userId,
          })

          throw new TRPCError({
            code: "NOT_FOUND",
            message: `VM Template with ID ${input.id} not found`,
          })
        }

        const updatedValues: Partial<typeof vmTemplateTable.$inferInsert> = {
          cpuCores: input.cpuCores,
          description: input.description,
          diskGb: input.diskGb,
          displayName: input.displayName,
          memoryMb: input.memoryMb,
          status: input.status,
        }

        const [updatedTemplate] = await ctx.db
          .update(vmTemplateTable)
          .set(updatedValues)
          .where(eq(vmTemplateTable.id, input.id))
          .returning()

        if (!updatedTemplate) {
          await logOnly({
            action: "admin:update_vm_template_failed",
            db: ctx.db,
            details: {
              error: `Failed to update VM Template with ID ${input.id}`,
            },
            resourceId: input.id,
            resourceType: "vm_template",
            userId,
          })

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update VM Template",
          })
        }

        await logAndNotify({
          action: "admin:update_vm_template",
          db: ctx.db,
          details: {
            cpuCores: updatedTemplate.cpuCores,
            diskGb: updatedTemplate.diskGb,
            displayName: updatedTemplate.displayName,
            memoryMb: updatedTemplate.memoryMb,
            status: updatedTemplate.status,
          },
          notifyMessage: `VM Template "${updatedTemplate.displayName}" updated`,
          notifyStatus: "success",
          resourceId: updatedTemplate.id,
          resourceType: "vm_template",
          userId,
        })

        return updatedTemplate
      }),
  }),

  users: createTRPCRouter({
    approve: adminProcedure
      .input(
        z.object({
          userId: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id: adminUserId } = ctx.session.user

        const [user] = await ctx.db
          .update(userTable)
          .set({ approved: true })
          .where(eq(userTable.id, input.userId))
          .returning()

        if (!user) {
          await logOnly({
            action: "admin:approve_user_failed",
            db: ctx.db,
            details: {
              error: `User with ID ${input.userId} not found`,
              targetUserId: input.userId,
            },
            resourceId: input.userId,
            resourceType: "user",
            userId: adminUserId,
          })

          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User with ID ${input.userId} not found`,
          })
        }

        await logOnly({
          action: "admin:approve_user",
          db: ctx.db,
          details: {
            targetUserEmail: user.email,
            targetUserId: user.id,
          },
          resourceId: user.id,
          resourceType: "user",
          userId: adminUserId,
        })

        return user
      }),

    list: adminProcedure
      .input(
        z.object({
          cursor: z
            .object({
              createdAt: z.date(),
              id: z.string(),
            })
            .nullish(),
          limit: z.number().min(1).max(50).default(10),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { cursor, limit } = input

        const rows = await ctx.db
          .select({
            ...getTableColumns(userTable),
            vmCount: ctx.db
              .$count(vmTable, eq(vmTable.userId, userTable.id))
              .as("vmCount"),
          })
          .from(userTable)
          .where(
            cursor
              ? or(
                  lt(userTable.createdAt, cursor.createdAt),
                  and(
                    eq(userTable.createdAt, cursor.createdAt),
                    lt(userTable.id, cursor.id),
                  ),
                )
              : undefined,
          )
          .orderBy(desc(userTable.createdAt), desc(userTable.id))
          .limit(limit + 1)

        const hasMore = rows.length > limit
        const items = hasMore ? rows.slice(0, -1) : rows
        const lastItem = items[items.length - 1]
        const nextCursor =
          hasMore && lastItem
            ? { createdAt: lastItem.createdAt, id: lastItem.id }
            : null

        return {
          items,
          nextCursor,
        }
      }),
  }),
})
