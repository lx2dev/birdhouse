import { createTRPCRouter, publicProcedure } from "@/server/api/init"

export const helloRouter = createTRPCRouter({
  world: publicProcedure.query(() => {
    return "Hello World!"
  }),
})
