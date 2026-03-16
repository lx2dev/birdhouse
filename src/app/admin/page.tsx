import { redirect } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { AdminView } from "@/modules/admin/views/admin"

export default async function AdminPage() {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return redirect("/auth/signin")

  void api.admin.getStats.prefetch()
  void api.admin.getRecentActivity.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <AdminView />
    </HydrateClient>
  )
}
