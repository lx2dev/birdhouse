import z from "zod"

import {
  operatingSystemStatusEnum,
  vmTemplateStatusEnum,
} from "@/server/db/schema"

export const insertVMTemplateSchema = z.object({
  cpuCores: z.number(),
  description: z.string().optional(),
  diskGb: z.number(),
  displayName: z.string(),
  memoryMb: z.number(),
  status: z.enum(vmTemplateStatusEnum.enumValues).default("testing"),
})

export const updateVMTemplateSchema = insertVMTemplateSchema.safeExtend({
  id: z.uuid(),
})

export const insertOperatingSystemSchema = z.object({
  displayName: z.string(),
  name: z.string(),
  osType: z.enum(["linux", "windows"]),
  osVersion: z.string(),
  proxmoxTemplateId: z.number(),
  status: z.enum(operatingSystemStatusEnum.enumValues).default("testing"),
})
