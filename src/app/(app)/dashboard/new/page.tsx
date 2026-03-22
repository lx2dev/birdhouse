import { redirect } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { NewComputeView } from "@/modules/dashboard/views/new-compute"

export default async function NewComputePage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.template.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })
  void api.sshKey.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })
  void api.os.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <NewComputeView />
    </HydrateClient>
  )
}
