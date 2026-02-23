import { SiteFooter } from "@/components/layout/site-footer"
import { AppSidebar } from "@/components/layout/site-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { AppHeader } from "@/modules/dashboard/ui/app-header"

export default function AppLayout({ children }: LayoutProps<"/">) {
  void api.notification.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })
  void api.account.getProfile.prefetch()

  return (
    <HydrateClient>
      <div className="min-h-svh">
        <SidebarProvider className="flex flex-col" defaultOpen={false}>
          <AppHeader />
          <AppSidebar />
          <main className="size-full p-4 lg:p-8">{children}</main>
        </SidebarProvider>
        <SiteFooter />
      </div>
    </HydrateClient>
  )
}
