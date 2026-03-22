import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function DomainsPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-bold text-3xl tracking-tight">Domains</h1>
      <p className="text-muted-foreground">Domain management is coming soon.</p>
    </div>
  )
}
