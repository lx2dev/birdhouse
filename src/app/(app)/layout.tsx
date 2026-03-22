import { AccountAccessBlocker } from "@/components/layout/account-access-blocker"
import { getSession } from "@/lib/auth/utils"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession()

  return (
    <>
      {children}
      <AccountAccessBlocker session={session} />
    </>
  )
}
