import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { templateRouter } from "@/server/api/routers/template"
import { vmRouter } from "@/server/api/routers/vm"

export const appRouter = createTRPCRouter({
  template: templateRouter,
  vm: vmRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
