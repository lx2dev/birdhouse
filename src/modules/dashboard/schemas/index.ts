import z from "zod"

export const createComputeSchema = z.object({
  name: z.string().min(3).max(50),
  templateId: z.uuid(),
})
