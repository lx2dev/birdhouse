import { SiteFooter } from "@/components/layout/site-footer"
import { AppSidebar } from "@/components/layout/site-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminHeader } from "@/modules/admin/ui/admin-header"

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-svh">
      <SidebarProvider className="flex flex-col" defaultOpen={false}>
        <AdminHeader />
        <AppSidebar />
        <main className="size-full p-4 lg:p-8">{children}</main>
      </SidebarProvider>
      <SiteFooter />
    </div>
  )
}
