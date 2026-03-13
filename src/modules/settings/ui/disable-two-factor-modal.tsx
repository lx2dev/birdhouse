"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconAlertCircle, IconLock, IconLockOpen2 } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { twoFactorSchema } from "@/modules/settings/schemas/account"

interface DisableTwoFactorModalProps {
  enabled: boolean
  hasPassword: boolean
}

export function DisableTwoFactorModal({
  enabled,
  hasPassword,
}: DisableTwoFactorModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      alert
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: (
          <>
            <IconLock /> Disable 2FA
          </>
        ),
        disabled: !hasPassword || !enabled,
      }}
    >
      <div className="space-y-4 px-8 md:p-0">
        <Alert variant="destructive">
          <IconAlertCircle />
          <AlertTitle>Are you sure you want to disable 2FA?</AlertTitle>
          <AlertDescription>
            Disabling 2FA will remove an extra layer of security from your
            account.
          </AlertDescription>
        </Alert>

        <DisableTwoFactorForm setOpen={setOpen} />
      </div>
    </ResponsiveModal>
  )
}

interface DisableTwoFactorFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function DisableTwoFactorForm({ setOpen }: DisableTwoFactorFormProps) {
  const router = useRouter()
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof twoFactorSchema>>({
    defaultValues: {
      password: "",
    },
    resolver: zodResolver(twoFactorSchema),
  })

  const disableTwoFactor = api.account.disableTwoFactor.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Two-factor authentication disabled")
      utils.account.getSecurityStatus.invalidate()
      setOpen(false)
      router.refresh()
    },
  })

  function onSubmit(values: z.infer<typeof twoFactorSchema>) {
    if (!values.password) return

    disableTwoFactor.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = disableTwoFactor.isPending || isSubmitting

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete="password"
              disabled={isLoading}
              id={field.name}
              placeholder="Enter your password"
              type="password"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
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
          {disableTwoFactor.isPending ? <Spinner /> : <IconLockOpen2 />}
          Disable 2FA
        </Button>
      </div>
    </form>
  )
}
