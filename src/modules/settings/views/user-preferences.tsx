import { Separator } from "@/components/ui/separator"
import { AppearanceSection } from "@/modules/settings/sections/appearance"

export function UserPreferencesView() {
  return (
    <div className="@container py-6">
      <AppearanceSection />
      <Separator className="my-8" />
    </div>
  )
}
