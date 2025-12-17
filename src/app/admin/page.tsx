import { api, HydrateClient } from "@/lib/api/server"
import { AdminView } from "@/modules/admin/views/admin"

export default function AdminPage() {
  void api.admin.getStats.prefetch()

  return (
    <HydrateClient>
      <AdminView />
    </HydrateClient>
  )
}
