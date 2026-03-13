"use client"

import { IconKey, IconLockCheck, IconLockOpen2 } from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import { DisableTwoFactorModal } from "@/modules/settings/ui/disable-two-factor-modal"
import { EnableTwoFactorModal } from "@/modules/settings/ui/enable-two-factor-modal"

export function TwoFactorSection() {
  return (
    <Suspense fallback={<TwoFactorSection.Skeleton />}>
      <ErrorBoundary fallback={<TwoFactorSection.Error />}>
        <TwoFactorSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function TwoFactorSectionSuspense() {
  const [profile] = api.account.getProfile.useSuspenseQuery()
  const [securityStatus] = api.account.getSecurityStatus.useSuspenseQuery()

  const enabled = securityStatus.twoFactorEnabled
  const hasPassword = profile.accounts.some(
    (account) => account.providerId === "credential",
  )

  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">
          Two-factor authentication
        </h2>
      </div>

      <div className="flex items-center gap-x-3">
        {enabled ? (
          <IconLockCheck className="size-4 shrink-0" />
        ) : (
          <IconLockOpen2 className="size-4 shrink-0" />
        )}
        <p className="text-base text-foreground/75">
          {enabled
            ? "Your account is protected with two-factor authentication."
            : hasPassword
              ? "Protect your account with an authenticator app."
              : "Set a password to enable two-factor authentication."}
        </p>
      </div>

      <div className="@md:ml-auto">
        {enabled ? (
          <DisableTwoFactorModal enabled={enabled} hasPassword={hasPassword} />
        ) : (
          <EnableTwoFactorModal enabled={enabled} hasPassword={hasPassword} />
        )}
      </div>
    </div>
  )
}

TwoFactorSection.Skeleton = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <h2 className="font-semibold text-xl tracking-tight">
        Two-factor authentication
      </h2>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="@md:ml-auto">
      <Button disabled variant="outline">
        <IconKey /> Enable 2FA
      </Button>
    </div>
  </div>
)

TwoFactorSection.Error = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <p className="text-destructive">
        Failed to load two-factor authentication settings
      </p>
    </div>
  </div>
)
