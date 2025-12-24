import { redirect } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { TemplateView } from "@/modules/admin/views/template"

export default async function AdminTemplatePage() {
  const session = await getSession()
  if (!session || session.user.role !== "admin") return redirect("/auth/signin")

  void api.template.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <TemplateView />
    </HydrateClient>
  )
}
