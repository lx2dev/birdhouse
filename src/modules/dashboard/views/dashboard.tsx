import { DashboardSection } from "@/modules/dashboard/sections/dashboard"

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Virtual Machines</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your cloud instances
        </p>
      </div>

      <DashboardSection />
    </div>
  )
}
