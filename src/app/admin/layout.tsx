import { notFound } from "next/navigation"

import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession()
  if (!session) return notFound()

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
          <AdminSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="size-full p-4 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <SiteFooter />
      </div>
    </HydrateClient>
  )
}
