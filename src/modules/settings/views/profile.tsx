import { Separator } from "@/components/ui/separator"
import { EmailAddressesSection } from "@/modules/settings/sections/email-addresses"
import { UserInfoSection } from "@/modules/settings/sections/user-info"

export function ProfileView() {
  return (
    <div className="@container py-6">
      <UserInfoSection />
      <Separator className="my-6" />
      <EmailAddressesSection />
      <Separator className="my-6" />

      {/* 
        TODO: Add more sections here:
        - Phone number
        - Connected accounts
      */}
    </div>
  )
}
