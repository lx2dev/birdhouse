import { redirect } from "next/navigation"

import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { AdminView } from "@/modules/admin/views/admin"

export default async function AdminPage() {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return redirect("/auth/signin")

  void api.admin.getStats.prefetch()

  return (
    <HydrateClient>
      <AdminView />
    </HydrateClient>
  )
}
