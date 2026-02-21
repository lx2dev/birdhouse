import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function AdminLogsPage() {
  const session = await getSession()
  if (!session || session.user.role !== "admin") return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-bold text-2xl tracking-tight">Logs</h1>
      <p className="text-muted-foreground">
        Audit and system logs are coming soon.
      </p>
    </div>
  )
}
