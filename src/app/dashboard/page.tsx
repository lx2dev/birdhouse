import { redirect } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { DashboardView } from "@/modules/dashboard/views/dashboard"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

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
