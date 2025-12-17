import { adminRouter } from "@/modules/admin/server/api/admin"
import { computeRouter } from "@/modules/dashboard/server/api/compute"
import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { osRouter } from "@/server/api/routers/os"
import { sshKeyRouter } from "@/server/api/routers/sshkey"
import { templateRouter } from "@/server/api/routers/template"
import { vmRouter } from "@/server/api/routers/vm"

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  compute: computeRouter,
  os: osRouter,
  sshKey: sshKeyRouter,
  template: templateRouter,
  vm: vmRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
