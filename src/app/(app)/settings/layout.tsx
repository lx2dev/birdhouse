import { redirect } from "next/navigation"

import { AppHeader } from "@/components/layout/app-header"
import { SettingsSidebar } from "@/components/layout/settings-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"

export default async function SettingsLayout({
  children,
}: LayoutProps<"/settings">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")
  const isAdmin = isUserAdmin(session)

  void api.account.getProfile.prefetch()
  void api.userPreferences.getAll.prefetch()

  return (
    <HydrateClient>
      <div className="min-h-svh">
        <SidebarProvider
          style={
            {
              "--header-height": "calc(var(--spacing) * 12)",
              "--sidebar-width": "calc(var(--spacing) * 74)",
            } as React.CSSProperties
          }
        >
          <SettingsSidebar isAdmin={isAdmin} />
          <SidebarInset>
            <AppHeader />
            <main className="size-full p-4 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </HydrateClient>
  )
}
