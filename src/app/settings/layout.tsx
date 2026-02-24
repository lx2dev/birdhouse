import { redirect } from "next/navigation"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"

export default async function SettingsLayout({
  children,
}: LayoutProps<"/settings">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.account.getProfile.prefetch()

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
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="size-full p-4 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </HydrateClient>
  )
}
