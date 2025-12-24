import { SiteFooter } from "@/components/layout/site-footer"
import { AdminHeader } from "@/modules/admin/layout/header"

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-svh">
      <AdminHeader />
      <main className="p-4 lg:p-8">{children}</main>
      <SiteFooter />
    </div>
  )
}
