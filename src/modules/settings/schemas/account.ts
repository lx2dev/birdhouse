import { createInsertSchema } from "drizzle-zod"
import z from "zod"

import { account, user } from "@/server/db/schema"

export const userInsertSchema = createInsertSchema(user)

export const accountInsertSchema = createInsertSchema(account)

export const passwordFormSchema = z
  .object({
    confirmNewPassword: z.string().min(12, "Please confirm your new password"),
    currentPassword: z.string().min(12, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters long"),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirmation do not match",
  })

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", {
    error: 'You must type "DELETE" to confirm',
  }),
})
