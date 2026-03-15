import { redirect } from "next/navigation"

import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { UserPreferencesView } from "@/modules/settings/views/user-preferences"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.userPreferences.getAll()

  return (
    <HydrateClient>
      <UserPreferencesView />
    </HydrateClient>
  )
}
