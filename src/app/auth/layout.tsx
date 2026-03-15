import Link from "next/link"

import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { APP_NAME } from "@/constants"

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--muted)_0%,transparent_20%,transparent_80%,var(--muted)_100%)] opacity-35" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[42px_42px] opacity-45" />

      <div className="z-10 flex w-full max-w-sm flex-col gap-2 md:gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium text-2xl"
          href="/"
        >
          <Icons.logo className="size-16 text-primary" />
          {APP_NAME}
        </Link>

        <Alert variant="warning">
          <AlertTitle>
            <strong>Warning:</strong> This is a demo
          </AlertTitle>
          <AlertDescription>
            <p>
              All data is periodically deleted. Do not use real credentials.
            </p>
            <p>
              You can find demo credentials{" "}
              <a
                className="underline underline-offset-4"
                href="/docs/demo"
                rel="noopener"
                target="_blank"
              >
                here
              </a>
              .
            </p>
          </AlertDescription>
        </Alert>

        <main>{children}</main>
      </div>
    </div>
  )
}
