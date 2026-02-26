import { Separator } from "@/components/ui/separator"
import { EmailAddressesSection } from "@/modules/settings/sections/email-addresses"
import { PhoneNumberSection } from "@/modules/settings/sections/phone-number"
import { UserInfoSection } from "@/modules/settings/sections/user-info"

export function ProfileView() {
  return (
    <div className="@container py-6">
      <UserInfoSection />
      <Separator className="my-8" />
      <EmailAddressesSection />
      <Separator className="my-8" />
      <PhoneNumberSection />
      <Separator className="my-8" />

      {/* 
        TODO: Add more sections here:
        - Connected accounts
      */}
    </div>
  )
}
