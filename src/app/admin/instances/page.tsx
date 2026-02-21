import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function AdminInstancesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "admin") return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-bold text-2xl tracking-tight">Instances</h1>
      <p className="text-muted-foreground">
        Instance management tools are coming soon.
      </p>
    </div>
  )
}
