"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconEye, IconEyeOff, IconRefresh } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { authClient } from "@/lib/auth/client"
import { ResetPasswordSchema } from "@/modules/auth/schemas/auth"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
    resolver: zodResolver(ResetPasswordSchema),
  })

  const { isSubmitting } = form.formState

  async function onSubmit(data: z.infer<typeof ResetPasswordSchema>) {
    await authClient.resetPassword({
      fetchOptions: {
        onError({ error }) {
          toast.error("Something went wrong", {
            description: error.message,
          })
        },
        onSuccess() {
          toast.success("Password reset successfully")
          router.push("/auth/signin")
        },
      },
      newPassword: data.password,
      token,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
              <InputGroup disabled={isSubmitting}>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                  placeholder="Enter your new password"
                  type={showPassword ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    type="button"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                Must be at least 12 characters long
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="passwordConfirmation"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
              <InputGroup disabled={isSubmitting}>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    type="button"
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button className="w-full" disabled={isSubmitting} type="submit">
          <IconRefresh className={isSubmitting ? "animate-spin" : ""} />
          Reset password
        </Button>
      </FieldGroup>
    </form>
  )
}
