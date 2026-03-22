import { IconAlertTriangle, IconMail, IconShield } from "@tabler/icons-react"
import Link from "next/link"

import { isUserApproved } from "@/helpers/is-user-approved"
import type { Session } from "@/lib/auth/utils"

interface AccountAccessBlockerProps {
  session: Session | null
}

export function AccountAccessBlocker({ session }: AccountAccessBlockerProps) {
  const { approved, emailVerified } = isUserApproved(session)

  if (approved) return null

  return (
    <div className="fixed inset-0 isolate z-50 flex items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative">
        <div className="absolute top-[-15%] left-[-10%] size-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-20%] size-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative w-full max-w-3xl rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl ring-1 ring-border/40 backdrop-blur-xl md:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-yellow-500/20" />
              <div className="relative rounded-2xl border border-yellow-500/30 bg-yellow-500/15 p-3 text-yellow-700 dark:text-yellow-300">
                <IconAlertTriangle className="size-6" />
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-2xl tracking-tight md:text-3xl">
                Access restricted
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm md:text-base">
                Your are signed in, but security checks are still pending.{" "}
                <br className="hidden md:block" />
                Access to the app stays locked until all required checks pass.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm">
                <IconShield className="size-4 text-muted-foreground" />
                <span className="font-medium">Account approval</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Manual approval by an administrator.
              </p>
              <p
                className={
                  approved
                    ? "mt-3 inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-700 text-xs dark:text-emerald-300"
                    : "mt-3 inline-flex rounded-full bg-yellow-500/15 px-2.5 py-1 font-medium text-xs text-yellow-700 dark:text-yellow-300"
                }
              >
                {approved ? "Approved" : "Pending approval"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm">
                <IconMail className="size-4 text-muted-foreground" />
                <span className="font-medium">Email verification</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Verify your email from the link we sent.
              </p>
              <p
                className={
                  emailVerified
                    ? "mt-3 inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-700 text-xs dark:text-emerald-300"
                    : "mt-3 inline-flex rounded-full bg-yellow-500/15 px-2.5 py-1 font-medium text-xs text-yellow-700 dark:text-yellow-300"
                }
              >
                {emailVerified ? "Verified" : "Not verified"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-background/60 p-4">
            <p className="text-balance text-muted-foreground text-sm">
              If this looks wrong, check your inbox and spam folder for a
              verification email, then refresh this page.
            </p>
            <p className="mt-3 text-sm">
              Need help?{" "}
              <Link
                className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/80"
                href="/support"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
