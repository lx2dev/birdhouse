import { redirect } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { getSession } from "@/lib/auth/utils"
import { AccountDeletionSection } from "@/modules/settings/sections/account-deletion"
import { PasswordSection } from "@/modules/settings/sections/password"
import { SessionsSection } from "@/modules/settings/sections/sessions"
import { TwoFactorSection } from "@/modules/settings/sections/two-factor"

export async function SecurityView() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="@container py-6">
      <PasswordSection />
      <Separator className="my-8" />
      <TwoFactorSection />
      <Separator className="my-8" />
      <SessionsSection session={session} />
      <Separator className="my-8" />
      <div className="mb-4">
        <p className="font-semibold text-2xl text-destructive tracking-tight">
          Danger Zone
        </p>
      </div>
      <AccountDeletionSection />
    </div>
  )
}
