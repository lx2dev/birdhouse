import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-bold text-2xl tracking-tight">Account</h1>
      <p className="text-muted-foreground">Profile settings are coming soon.</p>
    </div>
  )
}
