import { api, HydrateClient } from "@/lib/api/server"
import { NewComputeView } from "@/modules/dashboard/views/new-compute"

export default function NewComputePage() {
  void api.template.list.prefetch()

  return (
    <HydrateClient>
      <NewComputeView />
    </HydrateClient>
  )
}
