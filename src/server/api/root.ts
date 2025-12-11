import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { helloRouter } from "@/server/api/routers/post"

export const appRouter = createTRPCRouter({
  hello: helloRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
