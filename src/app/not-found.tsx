import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth/utils"

export default async function GlobalNotFound() {
  const session = await getSession()
  const primaryHref = session ? "/dashboard" : "/"
  const primaryLabel = session ? "Dashboard" : "Home"

  return (
    <main className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="text-center">
        <h1 className="font-extrabold text-[40ch] leading-none tracking-tight">
          404
        </h1>
        <h2 className="mt-6 text-5xl">Page not found</h2>
        <p className="mt-4 text-muted-foreground">
          You weren't supposed to see this.
        </p>

        <Button
          className="mt-10 h-12 px-6 text-base"
          nativeButton={false}
          render={<Link href={primaryHref} />}
          size="lg"
        >
          <IconArrowLeft />
          {primaryLabel}
        </Button>
      </div>
    </main>
  )
}
