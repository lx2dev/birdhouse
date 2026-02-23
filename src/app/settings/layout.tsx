import type { UserWithRole } from "better-auth/plugins"
import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/auth/utils"
import { SettingsHeader } from "@/modules/settings/ui/settings-header"
import { SettingsSidebar } from "@/modules/settings/ui/settings-sidebar"

export default async function SettingsLayout({
  children,
}: LayoutProps<"/settings">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="min-h-svh">
      <SidebarProvider
        style={
          {
            "--header-height": "calc(var(--spacing) * 12)",
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <SettingsSidebar />
        <SidebarInset>
          <SettingsHeader user={session.user as UserWithRole} />
          <main className="size-full p-4 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
