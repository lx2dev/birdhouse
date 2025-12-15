import { redirect } from "next/navigation"

import { AppHeader } from "@/components/layout/app-header"
import { AppFooter } from "@/components/layout/site-footer"
import { getSession } from "@/lib/auth/utils"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  if (!session) return redirect("/auth/signin")

  return (
    <div className="min-h-svh">
      <AppHeader user={session.user} />
      <main className="p-4 lg:p-8">{children}</main>
      <AppFooter />
    </div>
  )
}
