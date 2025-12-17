import { HydrateClient } from "@/lib/api/server"
import { InstanceView } from "@/modules/dashboard/views/instance"

export default async function ComputePage({
  params,
}: PageProps<"/dashboard/compute/[id]">) {
  const { id } = await params

  return (
    <HydrateClient>
      <InstanceView id={id} />
    </HydrateClient>
  )
}
