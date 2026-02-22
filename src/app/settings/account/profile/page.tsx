import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-semibold text-2xl tracking-tight">Profile details</h1>
    </div>
  )
}
