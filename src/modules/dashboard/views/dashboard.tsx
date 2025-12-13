import { DashboardSection } from "@/modules/dashboard/sections/dashboard"
import { DashboardHeader } from "@/modules/dashboard/sections/dashboard-header"

export function DashboardView() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardSection />
    </div>
  )
}
