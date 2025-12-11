import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { postRouter } from "@/server/api/routers/post"

export const appRouter = createTRPCRouter({
  post: postRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
