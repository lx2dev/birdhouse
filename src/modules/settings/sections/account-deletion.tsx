"use client"

import { DeleteAccountModal } from "@/modules/settings/ui/delete-account-modal"

export function AccountDeletionSection() {
  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4 rounded-lg border-2 border-destructive p-4">
      <div className="@md:col-span-2 self-start">
        <h2 className="font-semibold text-xl tracking-tight">Delete account</h2>
      </div>

      <div className="@md:ml-auto">
        <DeleteAccountModal />
      </div>
    </div>
  )
}
