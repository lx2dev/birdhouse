import { Separator } from "@/components/ui/separator"
import { UserInfoSection } from "@/modules/settings/sections/user-info"

export function ProfileView() {
  return (
    <div className="@container py-6">
      <UserInfoSection />
      <Separator className="my-6" />
      {/* 
        TODO: Add more sections here:
        - Email addresses
        - Phone number
        - Connected accounts
      */}
    </div>
  )
}
