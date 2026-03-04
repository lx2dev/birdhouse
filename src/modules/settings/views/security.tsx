import { Separator } from "@/components/ui/separator"
import { PasswordSection } from "@/modules/settings/sections/password"

export function SecurityView() {
  return (
    <div className="@container py-6">
      <PasswordSection />
      <Separator className="my-8" />
      {/* <TwoFactorSection /> */}
      {/* <Separator className="my-8" /> */}
      {/* <SessionsSection /> */}
      {/* <Separator className="my-8" /> */}
      {/* <AccountDeletionSection /> */}
    </div>
  )
}
