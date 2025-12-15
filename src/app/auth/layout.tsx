import Link from "next/link"
import { redirect } from "next/navigation"

import { Icons } from "@/components/icons"
import { getSession } from "@/lib/auth/utils"

export default async function AuthLayout({ children }: LayoutProps<"/auth">) {
  const session = await getSession()
  if (session) return redirect("/dashboard")

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
        <main>{children}</main>
      </div>
    </div>
  )
}
