import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { SSHKeyView } from "@/modules/dashboard/views/ssh-key"

export default function SSHKeyPage() {
  void api.sshKey.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <SSHKeyView />
    </HydrateClient>
  )
}
