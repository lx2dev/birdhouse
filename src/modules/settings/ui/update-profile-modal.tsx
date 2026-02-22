"use client"

import { IconDeviceFloppy } from "@tabler/icons-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import type { RouterOutputs } from "@/lib/api/client"
import { api } from "@/lib/api/client"

interface UpdateProfileModalProps {
  profile: RouterOutputs["account"]["getProfile"]
}

export function UpdateProfileModal({ profile }: UpdateProfileModalProps) {
  const utils = api.useUtils()

  const [open, setOpen] = React.useState(false)

  const updateUser = api.account.updateProfile.useMutation({
    onError(error) {
      toast.error(error.message)
    },
    onSuccess() {
      utils.account.getProfile.invalidate()
      setOpen(false)
      toast.success("Profile updated successfully")
    },
  })

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Update Profile
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
        </div>

        <Button
          disabled={updateUser.isPending}
          onClick={() => {
            updateUser.mutate({
              name: `${profile.name} (updated)`,
            })
          }}
        >
          {updateUser.isPending ? <Spinner /> : <IconDeviceFloppy />}
          Update Name
        </Button>
      </DialogContent>
    </Dialog>
  )
}
