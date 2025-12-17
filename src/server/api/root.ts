import { adminRouter } from "@/modules/admin/server/api/admin"
import { computeRouter } from "@/modules/dashboard/server/api/compute"
import { osRouter } from "@/modules/dashboard/server/api/os"
import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { sshKeyRouter } from "@/server/api/routers/sshkey"
import { templateRouter } from "@/server/api/routers/template"

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  compute: computeRouter,
  os: osRouter,
  sshKey: sshKeyRouter,
  template: templateRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
