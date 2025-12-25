import { adminRouter } from "@/modules/admin/server/api/admin"
import { computeRouter } from "@/modules/dashboard/server/api/compute"
import { osRouter } from "@/modules/dashboard/server/api/os"
import { sshKeyRouter } from "@/modules/dashboard/server/api/sshkey"
import { templateRouter } from "@/modules/dashboard/server/api/template"
import { createCallerFactory, createTRPCRouter } from "@/server/api/init"

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  compute: computeRouter,
  os: osRouter,
  sshKey: sshKeyRouter,
  template: templateRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
