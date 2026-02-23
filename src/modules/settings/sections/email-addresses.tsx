"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import { AddEmailModal } from "@/modules/settings/ui/add-email-modal"

export function EmailAddressesSection() {
  return (
    <Suspense fallback={<EmailAddressesSection.Skeleton />}>
      <ErrorBoundary fallback={<EmailAddressesSection.Error />}>
        {/* <EmailAddressesSection.Skeleton /> */}
        <EmailAddressesSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function EmailAddressesSectionSuspense() {
  const [profile] = api.account.getProfile.useSuspenseQuery()

  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">
          Email addresses
        </h2>
      </div>
      <div className="col-span-2 flex flex-col items-start gap-y-2">
        <input
          aria-readonly
          className="w-full max-w-xs text-foreground/75 focus-within:outline-0"
          defaultValue={profile.email}
          readOnly
          type="email"
        />
        <AddEmailModal currentEmail={profile.email} />
      </div>
    </div>
  )
}

EmailAddressesSection.Skeleton = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <h2 className="font-semibold text-xl tracking-tight">Email addresses</h2>
    </div>
    <div className="flex items-center gap-x-6">
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="@md:ml-auto" />
  </div>
)

EmailAddressesSection.Error = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <p className="text-destructive">Failed to load email addresses</p>
    </div>
  </div>
)
