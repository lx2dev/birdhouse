import { redirect } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { getSession } from "@/lib/auth/utils"
import { AdminHeader } from "@/modules/admin/layout/header"

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession()
  if (!session || session.user.role !== "admin") return redirect("/auth/signin")

  return (
    <div className="min-h-svh">
      <AdminHeader />
      <main className="p-4 lg:p-8">{children}</main>
      <SiteFooter />
    </div>
  )
}
