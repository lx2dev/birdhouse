import { Separator } from "@/components/ui/separator"
import { AccountDeletionSection } from "@/modules/settings/sections/account-deletion"
import { PasswordSection } from "@/modules/settings/sections/password"
import { TwoFactorSection } from "@/modules/settings/sections/two-factor"

export function SecurityView() {
  return (
    <div className="@container py-6">
      <PasswordSection />
      <Separator className="my-8" />
      <TwoFactorSection />
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
