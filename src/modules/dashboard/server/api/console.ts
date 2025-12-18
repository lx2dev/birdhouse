import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import z from "zod"

import { env } from "@/env"
import { getVNCTicket } from "@/lib/proxmox/novnc"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { vm as vmTable } from "@/server/db/schema"

export const consoleRouter = createTRPCRouter({
  getVNCAccess: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input

      const [instance] = await ctx.db
        .select({
          node: vmTable.proxmoxNode,
          status: vmTable.status,
          vmid: vmTable.vmid,
        })
        .from(vmTable)
        .where(eq(vmTable.id, id))
      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Instance with id ${id} not found`,
        })
      }
      if (instance.status !== "running") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Instance must be running to access console`,
        })
      }

      try {
        const { ticket, port } = await getVNCTicket(
          instance.node,
          instance.vmid,
        )

        return {
          host: env.PM_HOST,
          node: instance.node,
          port,
          ticket,
          vmid: instance.vmid,
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get VNC access: ${(error as Error).message}`,
        })
      }
    }),
})
