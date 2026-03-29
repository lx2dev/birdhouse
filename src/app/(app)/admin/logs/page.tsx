import { redirect } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import {
  AdminLogDateRangeSchema,
  AdminLogOutcomeSchema,
  AdminLogResourceTypeSchema,
} from "@/modules/admin/schemas"
import { LogsView } from "@/modules/admin/views/logs"

export default async function AdminLogsPage({
  searchParams,
}: PageProps<"/admin/logs">) {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)
  const params = (await searchParams) as {
    outcome?: string
    q?: string
    range?: string
    resourceType?: string
  }

  if (!session || !isAdmin) return redirect("/auth/signin")

  const parsedOutcome = AdminLogOutcomeSchema.safeParse(params.outcome)
  const parsedResourceType = AdminLogResourceTypeSchema.safeParse(
    params.resourceType,
  )
  const parsedRange = AdminLogDateRangeSchema.safeParse(params.range)

  const initialOutcome = parsedOutcome.success ? parsedOutcome.data : "all"
  const initialResourceType = parsedResourceType.success
    ? parsedResourceType.data
    : "all"
  const initialRange = parsedRange.success ? parsedRange.data : "24h"
  const initialQuery = params.q?.trim() ?? ""

  void api.admin.logs.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT * 3,
    outcome: initialOutcome,
    query: initialQuery || null,
    resourceType: initialResourceType,
    timeRange: initialRange,
  })

  return (
    <HydrateClient>
      <LogsView
        initialOutcome={initialOutcome}
        initialQuery={initialQuery}
        initialRange={initialRange}
        initialResourceType={initialResourceType}
      />
    </HydrateClient>
  )
}
