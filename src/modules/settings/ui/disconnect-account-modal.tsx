"use client"

import { IconPlugConnected } from "@tabler/icons-react"
import * as React from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { api } from "@/lib/api/client"
import { formatProviderName } from "@/modules/settings/lib/utils"

interface DisconnectAccountModalProps {
  providerId: string
}

export function DisconnectAccountModal({
  providerId,
}: DisconnectAccountModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [open, setOpen] = React.useState(false)

  if (isDesktop) {
    return (
      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogTrigger render={<Button size="sm" variant="outline" />}>
          Disconnect
        </AlertDialogTrigger>
        <AlertDialogContent>
          <DisconnectAccountConfirmationForm
            providerId={providerId}
            setOpen={setOpen}
          />
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline">
          Disconnect
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[50svh]">
        <DrawerHeader>
          <DrawerTitle hidden />
        </DrawerHeader>
        <DisconnectAccountConfirmationForm
          providerId={providerId}
          setOpen={setOpen}
        />
      </DrawerContent>
    </Drawer>
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
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Are you sure you want to disconnect your{" "}
        <span className="font-semibold">{formatProviderName(providerId)}</span>{" "}
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
