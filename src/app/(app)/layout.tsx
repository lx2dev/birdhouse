import { AccountAccessBlocker } from "@/components/layout/account-access-blocker"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <AccountAccessBlocker />
    </>
  )
}
