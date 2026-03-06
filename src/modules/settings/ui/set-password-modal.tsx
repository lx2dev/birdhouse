"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconKey, IconRefresh } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

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
import { Spinner } from "@/components/ui/spinner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { passwordFormSchema } from "@/modules/settings/schemas/account"
import { PasswordRequirements } from "@/modules/settings/ui/password-requirements"

interface SetPasswordModalProps {
  hasPassword: boolean
}

export function SetPasswordModal({ hasPassword }: SetPasswordModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [open, setOpen] = React.useState(false)

  if (isDesktop) {
    return (
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger
          render={<Button disabled={hasPassword} variant="outline" />}
        >
          <IconKey /> Set password
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <SetPasswordForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button disabled={hasPassword} variant="outline">
          <IconKey /> Set password
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[50svh]">
        <DrawerHeader>
          <DrawerTitle hidden />
        </DrawerHeader>
        <SetPasswordForm setOpen={setOpen} />
      </DrawerContent>
    </Drawer>
  )
}

interface SetPasswordFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const formSchema = passwordFormSchema.omit({
  currentPassword: true,
  revokeOtherSessions: true,
})

function SetPasswordForm({ setOpen }: SetPasswordFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      confirmNewPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(formSchema),
  })

  const setPassword = api.account.setPassword.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Password set successfully")
      form.reset()
      setOpen(false)
      utils.account.getProfile.invalidate()
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.newPassword !== values.confirmNewPassword) {
      toast.error("New password and confirmation do not match")
      return
    }

    setPassword.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = setPassword.isPending || isSubmitting

  return (
    <form
      className="mx-auto w-full max-w-md space-y-4 px-8 md:p-0"
      onSubmit={form.handleSubmit(onSubmit)}
    >
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
          Set password
        </Button>
      </div>
    </form>
  )
}
