import type { UserWithRole } from "better-auth/plugins"
import { redirect } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { AppSidebar } from "@/components/layout/site-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/auth/utils"
import { AdminHeader } from "@/modules/admin/ui/admin-header"

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="min-h-svh">
      <SidebarProvider className="flex flex-col" defaultOpen={false}>
        <AdminHeader user={session.user as UserWithRole} />
        <AppSidebar />
        <main className="size-full p-4 lg:p-8">{children}</main>
      </SidebarProvider>
      <SiteFooter />
    </div>
  )
}
