import { adminRouter } from "@/modules/admin/server/api/admin"
import { computeRouter } from "@/modules/dashboard/server/api/compute"
import { notificationRouter } from "@/modules/dashboard/server/api/notification"
import { osRouter } from "@/modules/dashboard/server/api/os"
import { sshKeyRouter } from "@/modules/dashboard/server/api/sshkey"
import { templateRouter } from "@/modules/dashboard/server/api/template"
import { accountRouter } from "@/modules/settings/server/api/account"
import { createCallerFactory, createTRPCRouter } from "@/server/api/init"

export const appRouter = createTRPCRouter({
  account: accountRouter,
  admin: adminRouter,
  compute: computeRouter,
  notification: notificationRouter,
  os: osRouter,
  sshKey: sshKeyRouter,
  template: templateRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
