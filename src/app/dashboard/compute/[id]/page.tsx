import { redirect } from "next/navigation"

import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { InstanceView } from "@/modules/dashboard/views/instance"

export default async function ComputePage({
  params,
}: PageProps<"/dashboard/compute/[id]">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  const { id } = await params

  void api.compute.getInstance.prefetch({ id })
  void api.compute.getInstanceStatus.prefetch({ id })

  return (
    <HydrateClient>
      <InstanceView id={id} user={session.user} />
    </HydrateClient>
  )
}
