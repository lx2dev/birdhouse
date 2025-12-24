import { redirect } from "next/navigation"

import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { AdminView } from "@/modules/admin/views/admin"

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.user.role !== "admin") return redirect("/auth/signin")

  void api.admin.getStats.prefetch()

  return (
    <HydrateClient>
      <AdminView />
    </HydrateClient>
  )
}
