import type { UserWithRole } from "better-auth/plugins"
import { redirect } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { AppSidebar } from "@/components/layout/site-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { AppHeader } from "@/modules/dashboard/ui/app-header"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  void api.notification.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <div className="min-h-svh">
        <SidebarProvider className="flex flex-col" defaultOpen={false}>
          <AppHeader user={session.user as UserWithRole} />
          <AppSidebar />
          <main className="size-full p-4 lg:p-8">{children}</main>
        </SidebarProvider>
        <SiteFooter />
      </div>
    </HydrateClient>
  )
}
