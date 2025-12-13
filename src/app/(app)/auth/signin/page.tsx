import Link from "next/link"

import { Icons } from "@/components/icons"
import { SignInView } from "@/modules/auth/views/signin"

export default function AuthPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium text-2xl"
          href="/"
        >
          <Icons.logo className="size-16" />
          Birdhouse
        </Link>
        <SignInView />
      </div>
    </div>
  )
}
