import { notFound, redirect } from "next/navigation"

import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import InstanceConsoleView from "@/modules/dashboard/views/instance-console"

export default async function InstanceConsolePage({
  params,
}: PageProps<"/dashboard/compute/[id]/console">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  const { id } = await params

  if (!id) return notFound()

  void api.compute.getInstance.prefetch({ id })
  void api.console.getVNCAccess.prefetch({ id })

  return (
    <HydrateClient>
      <InstanceConsoleView id={id} />
    </HydrateClient>
  )
}
