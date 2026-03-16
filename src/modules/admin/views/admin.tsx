import { HydrateClient } from "@/lib/api/server"
import { AdminMetricsSection } from "@/modules/admin/sections/admin-metrics"
import { RecentActivitySection } from "@/modules/admin/sections/recent-activity"
import { SystemHealthSection } from "@/modules/admin/sections/system-health"

export function AdminView() {
  return (
    <HydrateClient>
      <div className="@container space-y-6">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of the Birdhouse platform
          </p>
        </div>

        <AdminMetricsSection />

        <div className="grid @2xl:grid-cols-7 gap-6">
          <div className="@2xl:col-span-4">
            <RecentActivitySection />
          </div>
          <div className="@2xl:col-span-3">
            <SystemHealthSection />
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}
