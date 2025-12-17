import { count } from "drizzle-orm"

import { adminProcedure, createTRPCRouter } from "@/server/api/init"
import {
  user as userTable,
  vm as vmTable,
  vmTemplate as vmTemplateTable,
} from "@/server/db/schema"

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [[userCount], [templateCount], [vmCount]] = await Promise.all([
      ctx.db.select({ count: count() }).from(userTable),
      ctx.db.select({ count: count() }).from(vmTemplateTable),
      ctx.db.select({ count: count() }).from(vmTable),
    ])

    return {
      templateCount,
      userCount,
      vmCount,
    }
  }),
})
