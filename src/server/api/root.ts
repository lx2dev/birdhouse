import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { vmRouter } from "@/server/api/routers/vm"

export const appRouter = createTRPCRouter({
  vm: vmRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
