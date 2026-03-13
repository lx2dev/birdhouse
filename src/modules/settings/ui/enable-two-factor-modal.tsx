"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconCheck, IconCopy, IconLock, IconRefresh } from "@tabler/icons-react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import QRCode from "react-qr-code"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { twoFactorSchema } from "@/modules/settings/schemas/account"

interface EnableTwoFactorModalProps {
  enabled: boolean
  hasPassword: boolean
}

export function EnableTwoFactorModal({
  enabled,
  hasPassword,
}: EnableTwoFactorModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      alert
      className="max-md:min-h-full"
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: (
          <>
            <IconLock /> Enable 2FA
          </>
        ),
        disabled: !hasPassword || enabled,
      }}
    >
      <EnableTwoFactorForm setOpen={setOpen} />
    </ResponsiveModal>
  )
}

interface EnableTwoFactorFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function EnableTwoFactorForm({ setOpen }: EnableTwoFactorFormProps) {
  const router = useRouter()
  const utils = api.useUtils()

  const [copied, setCopied] = React.useState(false)
  const [trustDevice, setTrustDevice] = React.useState(false)
  const [verificationCode, setVerificationCode] = React.useState("")

  const form = useForm<z.infer<typeof twoFactorSchema>>({
    defaultValues: {
      password: "",
    },
    resolver: zodResolver(twoFactorSchema),
  })

  const enableTwoFactor = api.account.enableTwoFactor.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Scan your authenticator app and verify a code")
    },
  })

  function resetState() {
    form.reset()
    setVerificationCode("")
    enableTwoFactor.data = undefined
  }

  const verifyTwoFactor = api.account.verifyTwoFactor.useMutation({
    onError(error) {
      toast.error("Invalid authenticator code", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Two-factor authentication enabled")
      utils.account.getSecurityStatus.invalidate()
      resetState()
      setOpen(false)
      router.refresh()
    },
  })

  function onSubmit(values: z.infer<typeof twoFactorSchema>) {
    if (!values.password) return

    enableTwoFactor.mutate(values)
  }

  async function copySetupUri() {
    if (!enableTwoFactor.data) return

    try {
      await navigator.clipboard.writeText(enableTwoFactor.data.totpURI)
      setCopied(true)
      toast.success("Setup URI copied")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy setup URI", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const { isSubmitting } = form.formState
  const isLoading =
    enableTwoFactor.isPending || verifyTwoFactor.isPending || isSubmitting

  return (
    <div className="max-h-[calc(100svh-4rem)] overflow-y-auto overflow-x-hidden pb-8 md:pb-0">
      {!enableTwoFactor.data ? (
        <form
          className="space-y-4 px-8 md:p-0"
          onSubmit={form.handleSubmit(onSubmit)}
        >
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
              {enableTwoFactor.isPending ? <Spinner /> : <IconRefresh />}
              Generate setup
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 px-8 md:p-0">
          <div className="flex flex-col items-center gap-4">
            <QRCode value={enableTwoFactor.data.totpURI} />
            <Button
              onClick={copySetupUri}
              size="lg"
              type="button"
              variant="outline"
            >
              {copied ? <IconCheck /> : <IconCopy />}
              Copy setup URI
            </Button>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">Backup codes</p>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3 font-mono text-sm">
              {enableTwoFactor.data.backupCodes.map((code) => (
                <span key={code}>{code}</span>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Save these backup codes now. You can use each code once if you
              lose access to your authenticator app.
            </p>
          </div>

          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="verification-code">Verify Code</FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  disabled={isLoading}
                  id="verification-code"
                  maxLength={6}
                  onChange={(v) => setVerificationCode(v)}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={verificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      className="size-13 text-lg md:size-14 md:text-xl"
                      index={0}
                    />
                    <InputOTPSlot
                      className="size-13 text-lg md:size-14 md:text-xl"
                      index={1}
                    />
                    <InputOTPSlot
                      className="size-13 text-lg md:size-14 md:text-xl"
                      index={2}
                    />
                    <InputOTPSlot
                      className="size-13 text-lg md:size-14 md:text-xl"
                      index={3}
                    />
                    <InputOTPSlot
                      className="size-13 text-lg md:size-14 md:text-xl"
                      index={4}
                    />
                    <InputOTPSlot
                      className="size-13 text-lg md:size-14 md:text-xl"
                      index={5}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                disabled={isLoading}
                id="trust-device"
                name="trust-device"
                onCheckedChange={(checked) => setTrustDevice(checked)}
              />
              <Label htmlFor="trust-device">
                Trust this device for 30 days
              </Label>
            </Field>

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
              <Button
                disabled={
                  (verificationCode.trim().length < 6 && !isLoading) ||
                  isLoading
                }
                onClick={() => {
                  verifyTwoFactor.mutate({
                    code: verificationCode,
                    trustDevice,
                  })
                }}
              >
                {verifyTwoFactor.isPending ? <Spinner /> : <IconLock />}
                Verify and enable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
