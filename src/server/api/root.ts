import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { computeRouter } from "@/server/api/routers/compute"
import { sshKeyRouter } from "@/server/api/routers/sshkey"
import { templateRouter } from "@/server/api/routers/template"
import { vmRouter } from "@/server/api/routers/vm"

export const appRouter = createTRPCRouter({
  compute: computeRouter,
  sshKey: sshKeyRouter,
  template: templateRouter,
  vm: vmRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
