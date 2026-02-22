import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function SecurityPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="space-y-2">
      <h1 className="font-semibold text-2xl tracking-tight">
        Security settings
      </h1>
    </div>
  )
}
