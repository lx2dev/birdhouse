"use client"

import { IconPlugConnected } from "@tabler/icons-react"
import * as React from "react"
import { toast } from "sonner"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { TrustedSocialProvider } from "@/constants"
import { api } from "@/lib/api/client"
import { formatProviderName } from "@/modules/settings/lib/utils"

interface DisconnectAccountModalProps {
  providerId: string
}

export function DisconnectAccountModal({
  providerId,
}: DisconnectAccountModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      alert
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: <>Disconnect</>,
        size: "sm",
      }}
    >
      <DisconnectAccountConfirmationForm
        providerId={providerId}
        setOpen={setOpen}
      />
    </ResponsiveModal>
  )
}

interface DisconnectAccountConfirmationFormProps {
  providerId: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function DisconnectAccountConfirmationForm({
  providerId,
  setOpen,
}: DisconnectAccountConfirmationFormProps) {
  const utils = api.useUtils()

  const disconnectAccount = api.account.disconnect.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Account disconnected successfully")
      utils.account.getProfile.invalidate()
      setOpen(false)
    },
  })

  function handleDisconnect() {
    disconnectAccount.mutate({
      providerId,
    })
  }

  return (
    <div className="space-y-4 px-8 md:p-0">
      <p className="text-muted-foreground text-sm">
        Are you sure you want to disconnect your{" "}
        <span className="font-semibold">
          {formatProviderName(providerId as TrustedSocialProvider)}
        </span>{" "}
        account? This action cannot be undone.
      </p>

      <Button
        className="w-full"
        disabled={disconnectAccount.isPending}
        onClick={handleDisconnect}
        variant="destructive"
      >
        {disconnectAccount.isPending ? <Spinner /> : <IconPlugConnected />}
        Disconnect
      </Button>
    </div>
  )
}
