import { Separator } from "@/components/ui/separator"
import { EmailNotificationsSection } from "@/modules/settings/sections/email-notifications"

export function NotificationsView() {
  return (
    <div className="@container py-6">
      <EmailNotificationsSection />
      <Separator className="my-8" />
    </div>
  )
}
