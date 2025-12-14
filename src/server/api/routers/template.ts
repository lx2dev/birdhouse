import { asc, eq } from "drizzle-orm"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { vmTemplate as vmTemplateTable } from "@/server/db/schema"

export const templateRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db
      .select()
      .from(vmTemplateTable)
      .where(eq(vmTemplateTable.status, "available"))
      .orderBy(asc(vmTemplateTable.cpuCores))

    return templates
  }),
})
