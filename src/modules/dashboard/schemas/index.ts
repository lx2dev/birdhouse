import z from "zod"

export const createComputeSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: "Name can only contain lowercase letters, numbers, and hyphens",
    }),
  templateId: z
    .uuid({
      error: "Please select a valid template",
    })
    .nonempty("Please select a template"),
})
