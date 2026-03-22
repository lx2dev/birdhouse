import { redirect } from "next/navigation"

import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { ProfileView } from "@/modules/settings/views/profile"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.account.getProfile.prefetch()

  return (
    <HydrateClient>
      <ProfileView />
    </HydrateClient>
  )
}
