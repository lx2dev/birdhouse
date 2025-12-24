import { redirect } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { SSHKeyView } from "@/modules/dashboard/views/ssh-key"

export default async function SSHKeyPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.sshKey.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <SSHKeyView />
    </HydrateClient>
  )
}
