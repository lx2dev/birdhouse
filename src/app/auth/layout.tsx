import Link from "next/link"

import { DotGrid } from "@/components/backgrounds/dot-grid"
import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0">
        <DotGrid
          activeColor="#5227FF"
          baseColor="#271E37"
          dotSize={5}
          gap={15}
          proximity={120}
          resistance={750}
          returnDuration={1.5}
          shockRadius={250}
          shockStrength={5}
        />
      </div>

      <div className="z-10 flex w-full max-w-sm flex-col gap-2 md:gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium text-2xl"
          href="/"
        >
          <Icons.logo className="size-16 text-primary" />
          Birdhouse
        </Link>

        <Alert variant="warning">
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
