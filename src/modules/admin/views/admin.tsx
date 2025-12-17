import { AdminSection } from "@/modules/admin/sections/admin"
import { QuickActionsSection } from "@/modules/admin/sections/quick-actions"

export function AdminView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage users and virtual machines
        </p>
      </div>
      <AdminSection />
      <QuickActionsSection />
    </div>
  )
}
