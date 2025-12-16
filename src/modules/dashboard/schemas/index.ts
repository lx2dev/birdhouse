import z from "zod"

export const createComputeSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: "Name can only contain lowercase letters, numbers, and hyphens",
    }),
  operatingSystemId: z
    .uuid({
      error: "Please select a valid operating system",
    })
    .nonempty("Operating system is required"),
  sshKeyId: z
    .uuid({
      error: "Please select a valid SSH key",
    })
    .nonempty("SSH key is required"),
  templateId: z
    .uuid({
      error: "Please select a valid template",
    })
    .nonempty("Please select a template"),
})

export const createSSHKeySchema = z.object({
  bits: z.number().int().min(2048).max(4096).default(2048).optional(),
  keyType: z.enum(["rsa", "ed25519"]).default("rsa"),
  name: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9-_ ]+$/, {
      message:
        "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    }),
})
