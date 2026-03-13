import { redirect } from "next/navigation"

import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { SecurityView } from "@/modules/settings/views/security"

export default async function SecurityPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.account.getProfile.prefetch()
  void api.account.getSecurityStatus.prefetch()
  void api.account.listSessions.prefetch()

  return (
    <HydrateClient>
      <SecurityView />
    </HydrateClient>
  )
}
