import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function NotificationSettingsPage() {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    /**
     * - Notifications
     *  - Email
     */
    <div className="space-y-2">
      <h1 className="font-bold text-2xl tracking-tight">
        Notification Settings
      </h1>
      <p className="text-muted-foreground">
        Notification preferences are coming soon.
      </p>
    </div>
  )
}
