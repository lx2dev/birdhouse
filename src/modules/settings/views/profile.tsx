import { Separator } from "@/components/ui/separator"
import { ConnectedAccountsSection } from "@/modules/settings/sections/connected-accounts"
import { EmailAddressesSection } from "@/modules/settings/sections/email-addresses"
import { UserInfoSection } from "@/modules/settings/sections/user-info"

export function ProfileView() {
  return (
    <div className="@container py-6">
      <UserInfoSection />
      <Separator className="my-8" />
      <EmailAddressesSection />
      <Separator className="my-8" />
      <ConnectedAccountsSection />
    </div>
  )
}
