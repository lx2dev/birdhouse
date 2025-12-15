import z from "zod"

import { vmTemplateStatusEnum } from "@/server/db/schema"

export const insertVMTemplateSchema = z.object({
  cpuCores: z.number(),
  description: z.string().optional(),
  diskGb: z.number(),
  displayName: z.string(),
  memoryMb: z.number(),
  osType: z.string(),
  proxmoxTemplateId: z.string(),
  status: z.enum(vmTemplateStatusEnum.enumValues).default("testing"),
})
