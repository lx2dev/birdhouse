import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { DashboardView } from "@/modules/dashboard/views/dashboard"

export default function DashboardPage() {
  void api.compute.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })
  void api.sshKey.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  )
}
