import { redirect } from "next/navigation"

import { AppFooter } from "@/components/layout/app-footer"
import { AppHeader } from "@/components/layout/app-header"
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
