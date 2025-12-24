import type { UserWithRole } from "better-auth/plugins"
import { redirect } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { getSession } from "@/lib/auth/utils"
import { AppHeader } from "@/modules/dashboard/ui/app-header"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="min-h-svh">
      <AppHeader user={session.user as UserWithRole} />
      <main className="p-4 lg:p-8">{children}</main>
      <SiteFooter />
    </div>
  )
}
