import z from "zod"

export const userPreferencesSchema = z.object({
  notifications: z
    .object({
      emailOnComputeEvents: z.boolean(),
      emailOnSystemAlerts: z.boolean(),
    })
    .default({
      emailOnComputeEvents: false,
      emailOnSystemAlerts: true,
    }),
  theme: z.enum(["light", "dark", "system"]).default("system"),
})
