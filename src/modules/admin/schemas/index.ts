import z from "zod"

import { vmTemplateStatusEnum } from "@/server/db/schema"

export const insertVMTemplateSchema = z.object({
  cpuCores: z.number(),
  description: z.string().optional(),
  diskGb: z.number(),
  displayName: z.string(),
  memoryMb: z.number(),
  operatingSystemId: z.uuid(),
  status: z.enum(vmTemplateStatusEnum.enumValues).default("testing"),
})
