import Link from "next/link"

import { isUserApproved } from "@/helpers/is-user-approved"
import type { Session } from "@/lib/auth/utils"

interface AccountAccessBlockerProps {
  session: Session
}

export function AccountAccessBlocker({ session }: AccountAccessBlockerProps) {
  const isApproved = isUserApproved(session)

  if (isApproved) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl rounded-xl border bg-card/95 p-6 shadow-2xl">
        <h2 className="font-semibold text-xl tracking-tight">
          Access restricted
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Your account currently cannot use the app. Review the status below.
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-background/80 px-4 py-3 text-sm">
            <span className="font-medium">Account approved</span>
            <span
              className={
                !isApproved
                  ? "font-medium text-yellow-600 dark:text-yellow-400"
                  : "font-medium text-emerald-600 dark:text-emerald-400"
              }
            >
              {!isApproved ? "Pending approval" : "Approved"}
            </span>
          </div>
        </div>

        <p className="mt-5 text-muted-foreground text-sm">
          If this looks wrong,{" "}
          <Link
            className="text-primary underline underline-offset-2"
            href="/support"
          >
            contact support
          </Link>{" "}
          or try again later.
        </p>
      </div>
    </div>
  )
}
