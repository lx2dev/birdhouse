import { createInsertSchema } from "drizzle-zod"
import z from "zod"

import { account, user } from "@/server/db/schema"

export const userInsertSchema = createInsertSchema(user)

export const adminCreateUserSchema = userInsertSchema.pick({
  approved: true,
  email: true,
  emailVerified: true,
  name: true,
  role: true,
})

export const accountInsertSchema = createInsertSchema(account)

export const passwordFormBaseSchema = z.object({
  confirmNewPassword: z.string().min(12, "Please confirm your new password"),
  currentPassword: z.string().min(12, "Current password is required"),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters long"),
  revokeOtherSessions: z.boolean(),
})

export const changePasswordSchema = passwordFormBaseSchema.refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  },
)

export const setPasswordSchema = passwordFormBaseSchema
  .omit({
    currentPassword: true,
    revokeOtherSessions: true,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmNewPassword"],
  })

export const revokeSessionSchema = z.object({
  token: z.string().min(1, "Session token is required"),
})

export const twoFactorSchema = z.object({
  password: z.string().min(12, "Password is required"),
})

export const twoFactorVerifySchema = z.object({
  code: z.string().trim().min(6, "Authenticator code is required"),
  trustDevice: z.boolean().optional(),
})

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", {
    error: 'You must type "DELETE" to confirm',
  }),
})
