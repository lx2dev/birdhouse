import { redirect } from "next/navigation"

import { isUserAdmin } from "@/helpers/is-user-admin"
import { getSession } from "@/lib/auth/utils"

export default async function AdminUsersPage() {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-bold text-2xl tracking-tight">Users</h1>
      <p className="text-muted-foreground">User management is coming soon.</p>
    </div>
  )
}
