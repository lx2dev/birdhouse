"use client"

import { formatDate } from "date-fns"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

import { getIconForProvider } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { TRUSTED_SOCIAL_PROVIDERS } from "@/constants"
import { api } from "@/lib/api/client"
import { authClient } from "@/lib/auth/client"
import { formatProviderName } from "@/modules/settings/lib/utils"
import { DisconnectAccountModal } from "@/modules/settings/ui/disconnect-account-modal"

export function ConnectedAccountsSection() {
  return (
    <Suspense fallback={<ConnectedAccountsSection.Skeleton />}>
      <ErrorBoundary fallback={<ConnectedAccountsSection.Error />}>
        <ConnectedAccountsSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function ConnectedAccountsSuspense() {
  const [connectingProvider, setConnectingProvider] = React.useState<
    string | null
  >(null)

  const [{ accounts }] = api.account.getProfile.useSuspenseQuery()

  async function connectAccount(provider: string) {
    try {
      setConnectingProvider(provider)

      await authClient.linkSocial({
        callbackURL: "/settings/account/profile",
        provider,
      })
    } catch (error) {
      console.error("Failed to connect account:", error)
      toast.error("Failed to connect account. Please try again.")
    } finally {
      setConnectingProvider(null)
    }
  }

  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">
          Connected Accounts
        </h2>
      </div>
      <div className="col-span-2">
        {TRUSTED_SOCIAL_PROVIDERS.map((provider) => {
          const account = accounts.find((acc) => acc.providerId === provider)

          return (
            <div
              className="col-end-1 grid w-full @md:grid-cols-3 items-center @md:gap-0 gap-4 rounded-md p-4 odd:bg-muted/50 dark:odd:bg-popover/50"
              key={provider}
            >
              <div className="flex items-center gap-2">
                {getIconForProvider(provider, "size-6")}
                <span className="font-semibold text-sm capitalize">
                  {formatProviderName(provider)}
                </span>
              </div>

              {account ? (
                <>
                  <div className="text-muted-foreground text-sm">
                    Connected on {formatDate(account.createdAt, "MMM d, yyyy")}
                  </div>

                  {accounts.length > 1 && (
                    <div className="@md:ml-auto">
                      <DisconnectAccountModal providerId={account.providerId} />
                    </div>
                  )}
                </>
              ) : (
                <div className="col-span-2 @md:ml-auto">
                  <Button
                    disabled={connectingProvider !== null}
                    onClick={() => connectAccount(provider)}
                    size="sm"
                    variant="outline"
                  >
                    {connectingProvider === provider && <Spinner />}
                    Connect
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

ConnectedAccountsSection.Skeleton = function ConnectedAccountsSkeleton() {
  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">
          Connected Accounts
        </h2>
      </div>
      <div className="col-span-2 flex flex-col items-start gap-y-8 rounded-md border bg-muted p-4 dark:bg-popover/50">
        {TRUSTED_SOCIAL_PROVIDERS.map((provider) => (
          <div
            className="col-end-1 grid w-full @md:grid-cols-3 items-center @md:gap-0 gap-4"
            key={provider}
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="text-muted-foreground text-sm">
              <Skeleton className="h-4 w-44" />
            </div>

            <div className="@md:ml-auto">
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

ConnectedAccountsSection.Error = function ConnectedAccountsError() {
  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <p className="text-destructive">Failed to load connected accounts</p>
      </div>
    </div>
  )
}
