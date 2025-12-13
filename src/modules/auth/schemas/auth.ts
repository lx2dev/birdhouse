import z from "zod"

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters long"),
})

export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Username is required"),
  password: z.string().min(12, "Password must be at least 12 characters long"),
})
