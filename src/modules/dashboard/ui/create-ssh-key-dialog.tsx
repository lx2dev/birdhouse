"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconAlertCircleFilled,
  IconCheck,
  IconCopy,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { createSSHKeySchema } from "@/modules/dashboard/schemas"
import type { SSHKeyTable } from "@/server/db/schema"

interface CreateSSHKeyDialogProps {
  children?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateSSHKeyDialog(props: CreateSSHKeyDialogProps) {
  const { children, open, onOpenChange } = props

  const utils = api.useUtils()

  const [sshKey, setSSHKey] = React.useState<
    (SSHKeyTable & { privateKey: string }) | null
  >(null)
  const [copied, setCopied] = React.useState<boolean>(false)

  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createSSHKeySchema),
  })

  const { isSubmitting } = form.formState

  const createSSHKey = api.sshKey.create.useMutation({
    onError(error) {
      toast.error("Failed to create SSH key:", {
        description: error.message,
      })
    },
    onSuccess(data) {
      setSSHKey(data)
      form.reset()
      utils.sshKey.list.invalidate()
    },
  })

  async function onSubmit(data: z.infer<typeof createSSHKeySchema>) {
    await createSSHKey.mutateAsync(data)
  }

  function handleCopyPrivateKey() {
    navigator.clipboard.writeText(sshKey?.privateKey || "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadPrivateKey(
    privateKeyContent: string,
    keyName: string,
  ) {
    const blob = new Blob([privateKeyContent], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `id_${keyName.toLowerCase().replace(/\s/g, "-")}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) {
          setSSHKey(null)
        }
        onOpenChange?.(open)
      }}
      open={open}
    >
      {children && <AlertDialogTrigger render={children} />}
      <AlertDialogContent className="sm:max-w-md">
        {sshKey ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                SSH Key Pair Created Successfully
              </AlertDialogTitle>
            </AlertDialogHeader>

            <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <IconAlertCircleFilled />
              <AlertTitle className="font-semibold">Important:</AlertTitle>
              <AlertDescription className="text-amber-600 dark:text-amber-500">
                For security reasons, this is the only time you will be able to
                view or download your private key. Make sure to store it safely.
              </AlertDescription>
            </Alert>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <Label className="mb-2 block font-medium">Private Key:</Label>
                <InputGroup className="w-full">
                  <InputGroupTextarea
                    className="resize-none font-mono"
                    readOnly
                    rows={6}
                    value={sshKey.privateKey}
                  />
                  <InputGroupAddon align="inline-end" className="items-start">
                    <InputGroupButton
                      className="ml-auto text-foreground"
                      onClick={handleCopyPrivateKey}
                      size="icon-xs"
                      type="button"
                    >
                      {copied ? (
                        <IconCheck className="text-green-500" />
                      ) : (
                        <IconCopy />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <AlertDialogFooter className="border-0 bg-transparent dark:bg-transparent">
                <Button
                  onClick={() => {
                    handleDownloadPrivateKey(sshKey.privateKey, sshKey.name)
                  }}
                  type="button"
                >
                  <IconDownload />
                  Download Private Key
                </Button>
              </AlertDialogFooter>
            </div>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New SSH Key Pair</AlertDialogTitle>
              <AlertDialogDescription>
                Generate a new SSH key pair for secure access to your computes.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form
              onSubmit={(e) => {
                e.stopPropagation()
                form.handleSubmit(onSubmit)(e)
              }}
            >
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                        id={field.name}
                        placeholder="My SSH Key"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <DialogFooter className="border-0 bg-transparent dark:bg-transparent">
                <Button disabled={isSubmitting} size="sm" type="submit">
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconPlus />
                      Generate Key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
