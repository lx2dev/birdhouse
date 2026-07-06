import Link from "next/link"

import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { APP_NAME } from "@/constants"

export default function Layout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="z-10 flex w-full flex-col justify-center gap-2 md:gap-6">
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
          <p>All data is periodically deleted. Do not use real credentials.</p>
          <p>
            You can find demo credentials{" "}
            {/* biome-ignore-start lint/a11y/noAmbiguousAnchorText: sufficient context */}
            <a
              className="underline underline-offset-4"
              href="/docs/demo"
              rel="noopener"
              target="_blank"
            >
              here
            </a>
            {/* biome-ignore-end lint/a11y/noAmbiguousAnchorText: sufficient context */}
            .
          </p>
        </AlertDescription>
      </Alert>

      {children}
    </div>
  )
}
