"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconTrash } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { deleteAccountSchema } from "@/modules/settings/schemas/account"

export function DeleteAccountModal() {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      alert
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: (
          <>
            <IconTrash /> Delete account
          </>
        ),
        variant: "destructive",
      }}
    >
      <DeleteAccountForm setOpen={setOpen} />
    </ResponsiveModal>
  )
}

interface DeleteAccountFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function DeleteAccountForm({ setOpen }: DeleteAccountFormProps) {
  const form = useForm<z.infer<typeof deleteAccountSchema>>({
    resolver: zodResolver(deleteAccountSchema),
  })

  const deleteAccount = api.account.deleteAccount.useMutation({
    onError(error) {
      toast.error("Failed to delete account", {
        description: error.message,
      })
    },
    async onSuccess() {
      toast.success(
        "Please check your email for a confirmation link to complete account deletion",
      )
      setOpen(false)
    },
  })

  const { isSubmitting } = form.formState
  const isLoading = deleteAccount.isPending || isSubmitting

  const canDelete = form.watch("confirmation") === "DELETE"

  function onSubmit(values: z.infer<typeof deleteAccountSchema>) {
    const { confirmation } = values

    if (!canDelete) {
      form.setError("confirmation", {
        message: 'You must type "DELETE" to confirm',
      })
      return
    }

    deleteAccount.mutate({ confirmation })
  }

  return (
    <form
      className="space-y-4 px-8 md:p-0"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <p className="text-muted-foreground text-sm">
        This action permanently removes your account and cannot be undone. Type
        <span className="px-1 font-semibold">DELETE</span>to confirm.
      </p>

      <div className="space-y-2">
        <Controller
          control={form.control}
          name="confirmation"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isLoading}
                id={field.name}
                placeholder='Type "DELETE" to confirm'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button
          disabled={isLoading || !canDelete}
          type="submit"
          variant="destructive"
        >
          {isLoading ? <Spinner /> : <IconTrash />}
          Permanently delete account
        </Button>
      </div>
    </form>
  )
}
