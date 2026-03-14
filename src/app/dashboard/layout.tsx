import { redirect } from "next/navigation"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteFooter } from "@/components/layout/site-footer"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.notification.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })
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
          <AppSidebar session={session} />
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
