import { redirect } from "next/navigation"

import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { NotificationsView } from "@/modules/settings/views/notifications"

export default async function NotificationSettingsPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.userPreferences.getAll.prefetch()

  return (
    <HydrateClient>
      <NotificationsView />
    </HydrateClient>
  )
}
