"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconKey, IconRefresh } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { passwordFormSchema } from "@/modules/settings/schemas/account"
import { PasswordRequirements } from "@/modules/settings/ui/password-requirements"

interface ChangePasswordModalProps {
  hasPassword: boolean
}

export function ChangePasswordModal({ hasPassword }: ChangePasswordModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      className="max-md:min-h-full"
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: (
          <>
            <IconKey /> Change password
          </>
        ),
        disabled: !hasPassword,
      }}
    >
      <ChangePasswordForm setOpen={setOpen} />
    </ResponsiveModal>
  )
}

interface ChangePasswordFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function ChangePasswordForm({ setOpen }: ChangePasswordFormProps) {
  const router = useRouter()
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    defaultValues: {
      confirmNewPassword: "",
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    },
    resolver: zodResolver(passwordFormSchema),
  })

  const changePassword = api.account.changePassword.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Password changed successfully")
      form.reset()
      utils.account.getProfile.invalidate()
      router.refresh()
      setOpen(false)
    },
  })

  function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (values.newPassword !== values.confirmNewPassword) {
      toast.error("New password and confirmation do not match")
      return
    }

    if (values.currentPassword === values.newPassword) {
      toast.error("New password must be different from the current one")
      return
    }

    changePassword.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = changePassword.isPending || isSubmitting

  return (
    <form
      className="space-y-4 px-8 md:p-0"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="currentPassword"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Your current password</FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete="current-password"
              disabled={isLoading}
              id={field.name}
              placeholder="Enter your current password"
              type="password"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Your new password</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                disabled={isLoading}
                id={field.name}
                placeholder="Enter your new password"
                type="password"
              />
              <FieldDescription>
                {/* @ts-expect-error - mismatched types */}
                <PasswordRequirements field={field} />
              </FieldDescription>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirmNewPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Confirm your new password
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                disabled={isLoading}
                id={field.name}
                placeholder="Confirm your new password"
                type="password"
              />
              <FieldDescription
                className={cn(
                  "text-sm",
                  field.value === form.getValues("newPassword")
                    ? "text-green-500"
                    : "text-destructive",
                )}
              >
                {field.value.length > 0 &&
                  (field.value === form.getValues("newPassword")
                    ? "Passwords match"
                    : "Passwords do not match")}
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="revokeOtherSessions"
        render={({ field, fieldState }) => (
          <FieldGroup>
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Checkbox
                aria-invalid={fieldState.invalid}
                checked={field.value}
                id={field.name}
                name={field.name}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
              <FieldContent>
                <FieldLabel htmlFor={field.name}>
                  Revoke other sessions
                </FieldLabel>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>
                    Sign out of all other sessions when changing your password.
                  </FieldDescription>
                )}
              </FieldContent>
            </Field>
          </FieldGroup>
        )}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          disabled={isLoading}
          onClick={() => {
            form.reset()
            setOpen(false)
          }}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
        <Button disabled={isLoading} type="submit">
          {isLoading ? <Spinner /> : <IconRefresh />}
          Change password
        </Button>
      </div>
    </form>
  )
}
