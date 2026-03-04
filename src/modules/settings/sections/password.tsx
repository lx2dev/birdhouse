"use client"

import { IconKey } from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import { ChangePasswordModal } from "@/modules/settings/ui/change-password-modal"

export function PasswordSection() {
  return (
    <Suspense fallback={<PasswordSection.Skeleton />}>
      <ErrorBoundary fallback={<PasswordSection.Error />}>
        <PasswordSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function PasswordSectionSuspense() {
  const [profile] = api.account.getProfile.useSuspenseQuery()

  const hasPassword = profile.accounts.some(
    (acc) => acc.providerId === "credentials",
  )

  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">Password</h2>
      </div>
      <div className="flex items-center gap-x-6">
        <input
          className="w-full max-w-xs text-foreground/75 focus-within:outline-0"
          defaultValue={
            hasPassword
              ? "************"
              : "You are currently signed in with a third-party."
          }
          readOnly
          type={hasPassword ? "password" : "text"}
        />
      </div>
      <div className="@md:ml-auto">
        <ChangePasswordModal hasPassword={hasPassword} />
      </div>
    </div>
  )
}

PasswordSection.Skeleton = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <h2 className="font-semibold text-xl tracking-tight">Password</h2>
    </div>
    <div className="flex items-center gap-x-6">
      <Skeleton className="h-5 w-48" />
    </div>
    <div className="@md:ml-auto">
      <Button className="-ml-3" disabled variant="ghost">
        <IconKey /> Change password
      </Button>
    </div>
  </div>
)

PasswordSection.Error = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <p className="text-destructive">Failed to load password settings</p>
    </div>
  </div>
)
