import Link from "next/link"

import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-2 md:gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium text-2xl"
          href="/"
        >
          <Icons.logo className="size-16" />
          Birdhouse
        </Link>

        <Alert
          className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500 *:data-[slot=alert-description]:text-yellow-500/90 *:[svg]:text-current"
          variant="destructive"
        >
          <AlertTitle>
            <strong>Warning:</strong> This is a demo
          </AlertTitle>
          <AlertDescription>
            <p>
              All data is periodically deleted. Do not use real credentials.
            </p>
          </AlertDescription>
        </Alert>

        <main>{children}</main>
      </div>
    </div>
  )
}
