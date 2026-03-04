"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconCheck, IconKey, IconRefresh } from "@tabler/icons-react"
import * as React from "react"
import type { ControllerRenderProps } from "react-hook-form"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"

interface ChangePasswordModalProps {
  hasPassword: boolean
}

export function ChangePasswordModal({ hasPassword }: ChangePasswordModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [open, setOpen] = React.useState(false)

  if (isDesktop) {
    return (
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger
          render={
            <Button className="-ml-3" disabled={!hasPassword} variant="ghost" />
          }
        >
          <IconKey /> Change password
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <ChangePasswordForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button className="-ml-3" disabled={!hasPassword} variant="ghost">
          <IconKey /> Change password
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[50svh]">
        <DrawerHeader>
          <DrawerTitle hidden />
        </DrawerHeader>
        <ChangePasswordForm setOpen={setOpen} />
      </DrawerContent>
    </Drawer>
  )
}

interface ChangePasswordFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const formSchema = z
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

function ChangePasswordForm({ setOpen }: ChangePasswordFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      confirmNewPassword: "",
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    },
    resolver: zodResolver(formSchema),
  })

  const changePassword = api.account.changePassword.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
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
      className="mx-auto w-full max-w-md space-y-4 px-8 md:p-0"
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

      <div className="grid grid-cols-2 gap-4">
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
                <DynamicPasswordRequirements field={field} />
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

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

interface PasswordRequirementsProps {
  field: ControllerRenderProps<z.infer<typeof formSchema>, "newPassword">
}

function DynamicPasswordRequirements({ field }: PasswordRequirementsProps) {
  const { value } = field

  const requirements = [
    {
      isValid: value.length >= 12,
      label: "At least 12 characters",
    },
    {
      isValid: /[A-Z]/.test(value),
      label: "At least one uppercase letter",
    },
    {
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      label: "At least one special character",
    },
  ]

  return (
    <ul className="space-y-1">
      {requirements.map((requirement, index) => (
        <li
          className={cn(
            "flex items-center gap-2 text-sm",
            requirement.isValid ? "text-green-500" : "text-muted-foreground",
          )}
          key={index}
        >
          <IconCheck className="inline-block size-4 shrink-0" />
          {requirement.label}
        </li>
      ))}
    </ul>
  )
}
