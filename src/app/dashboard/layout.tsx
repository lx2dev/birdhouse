import type { UserWithRole } from "better-auth/plugins"
import { redirect } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/auth/utils"
import { AppHeader } from "@/modules/dashboard/ui/app-header"
import { AppSidebar } from "@/modules/dashboard/ui/app-sidebar"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="min-h-svh">
      <SidebarProvider className="flex flex-col" defaultOpen={false}>
        <AppHeader user={session.user as UserWithRole} />
        <AppSidebar />
        <main className="size-full p-4 lg:p-8">{children}</main>
      </SidebarProvider>
      <SiteFooter />
    </div>
  )
}
