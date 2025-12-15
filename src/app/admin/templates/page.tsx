import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { TemplateView } from "@/modules/admin/views/template"

export default function AdminTemplatePage() {
  void api.template.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <TemplateView />
    </HydrateClient>
  )
}
