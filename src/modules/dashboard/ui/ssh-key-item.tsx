"use client"

import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconForms,
  IconTrash,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import * as React from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import type { SSHKeyTable } from "@/server/db/schema"

interface SSHKeyItemProps {
  item: SSHKeyTable
}

// TODO: Fix overflow
export function SSHKeyItem({ item: key }: SSHKeyItemProps) {
  const [copy, setCopy] = React.useState<{
    field: "publicKey" | "fingerprint" | null
    timeoutId: NodeJS.Timeout | null
  }>({
    field: null,
    timeoutId: null,
  })

  function handleCopy(field: "publicKey" | "fingerprint") {
    navigator.clipboard.writeText(key[field])
    if (copy.timeoutId) {
      clearTimeout(copy.timeoutId)
    }
    const timeoutId = setTimeout(() => {
      setCopy({ field: null, timeoutId: null })
    }, 2000)
    setCopy({ field, timeoutId })
  }

  return (
    <Item className="not-last:mb-4" variant="outline">
      <ItemContent className="min-w-0">
        <ItemTitle>{key.name}</ItemTitle>
        <ItemDescription className="space-y-2">
          <span className="flex items-center justify-between rounded-(--radius) bg-muted p-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-medium">Public Key:</span>
              <code
                className="max-w-[48ch] truncate font-mono text-xs"
                title={key.publicKey}
              >
                {key.publicKey}
              </code>
            </span>
            <Button
              aria-label="Copy public key"
              className="ml-2 h-auto"
              onClick={() => handleCopy("publicKey")}
              size="icon"
              title="Copy public key"
              variant="ghost"
            >
              {copy.field === "publicKey" ? (
                <IconCheck className="text-green-500" />
              ) : (
                <IconCopy />
              )}
            </Button>
          </span>

          <span className="flex items-center justify-between rounded-md bg-muted p-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-medium">Fingerprint:</span>
              <code
                className="max-w-[28ch] truncate font-mono text-xs"
                title={key.fingerprint}
              >
                {key.fingerprint}
              </code>
            </span>
            <Button
              aria-label="Copy fingerprint"
              className="ml-2 h-auto"
              onClick={() => handleCopy("fingerprint")}
              size="icon"
              title="Copy fingerprint"
              variant="ghost"
            >
              {copy.field === "fingerprint" ? (
                <IconCheck className="text-green-500" />
              ) : (
                <IconCopy />
              )}
            </Button>
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <KeyItemActions item={key} />
      </ItemActions>
      <ItemFooter className="text-muted-foreground text-sm">
        Added{" "}
        {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
      </ItemFooter>
    </Item>
  )
}

function KeyItemActions({ item: key }: SSHKeyItemProps) {
  const utils = api.useUtils()

  const [dialog, setDialog] = React.useState<"delete" | null>(null)
  const [editDialog, setEditDialog] = React.useState<boolean>(false)
  const [nameValue, setNameValue] = React.useState<string>(key.name)
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false)

  const deleteKey = api.sshKey.delete.useMutation({
    onError(error) {
      toast.error("Failed to delete SSH key:", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("SSH key deleted successfully.")
      utils.sshKey.list.invalidate()
    },
  })

  const updateKey = api.sshKey.update.useMutation({
    onError(error) {
      toast.error("Failed to rename SSH key:", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("SSH key renamed successfully.")
      utils.sshKey.list.invalidate()
    },
  })

  function handleDownloadPublicKey() {
    try {
      setIsDownloading(true)
      const blob = new Blob([key.publicKey], {
        type: "text/plain;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `id_${key.name.toLowerCase().replace(/\s/g, "-")}.pub`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download public key:", error)
      toast.error("Failed to download public key.", {
        description: "Please try again later.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleDeleteKey() {
    await deleteKey.mutateAsync({
      id: key.id,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="icon" variant="ghost">
              <IconDotsVertical />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setTimeout(() => setEditDialog(true), 150)
              }}
            >
              <IconForms />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isDownloading}
              onClick={handleDownloadPublicKey}
            >
              {isDownloading ? <Spinner /> : <IconDownload />}
              Download Public Key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={deleteKey.isPending}
              onClick={() => {
                // allow dialog to open before closing menu
                setTimeout(() => setDialog("delete"), 150)
              }}
              variant="destructive"
            >
              <IconTrash />
              Delete Key
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        onOpenChange={() => setDialog(null)}
        open={dialog === "delete"}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this SSH key?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 flex items-center space-x-2 rounded-lg bg-muted p-4">
            <IconTrash className="text-destructive" />
            <span className="font-medium font-mono text-muted-foreground text-sm">
              {key.name}
            </span>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteKey.isPending}
              onClick={handleDeleteKey}
              variant="destructive"
            >
              {deleteKey.isPending ? <Spinner /> : <IconTrash />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={() => setEditDialog(false)} open={editDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Rename SSH Key</AlertDialogTitle>
            <AlertDialogDescription>
              Change the display name for this SSH key.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <Field>
              <Input
                id="ssh-key-name"
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="My SSH Key"
                value={nameValue}
              />
            </Field>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={updateKey.isPending}
              onClick={async () => {
                await updateKey.mutateAsync({ id: key.id, name: nameValue })
                setEditDialog(false)
              }}
            >
              {updateKey.isPending ? <Spinner /> : <IconCheck />}
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
