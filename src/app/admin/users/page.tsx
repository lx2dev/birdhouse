import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.user.role !== "admin") return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-bold text-2xl tracking-tight">Users</h1>
      <p className="text-muted-foreground">User management is coming soon.</p>
    </div>
  )
}
