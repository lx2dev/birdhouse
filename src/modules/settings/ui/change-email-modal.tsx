"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconRefresh } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { userInsertSchema } from "@/modules/settings/schemas/account"

interface ChangeEmailModalProps {
  currentEmail: string
}

export function ChangeEmailModal({ currentEmail }: ChangeEmailModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: (
          <>
            <IconRefresh /> Change email address
          </>
        ),
        className: "-ml-3",
        variant: "ghost",
      }}
    >
      <AddEmailForm currentEmail={currentEmail} setOpen={setOpen} />
    </ResponsiveModal>
  )
}

interface AddEmailFormProps {
  currentEmail: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const formSchema = userInsertSchema.pick({
  email: true,
})

function AddEmailForm({ currentEmail, setOpen }: AddEmailFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(formSchema),
  })

  const changeEmail = api.account.changeEmail.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Email change requested", {
        description:
          "Please check your current email inbox to verify your new email address.",
      })
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.email === currentEmail) {
      toast.error("New email address must be different from the current one")
      return
    }

    changeEmail.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = changeEmail.isPending || isSubmitting

  return (
    <form
      className="mx-auto w-full max-w-md space-y-4 px-8 md:p-0"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>New email address</FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              disabled={isLoading}
              id={field.name}
              placeholder="Enter new email address"
            />
            <FieldDescription className="text-xs">
              Changing your email address will require you to verify the new
              email before the change is applied.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          disabled={isLoading}
          onClick={() => {
            form.reset()
            setOpen(false)
          }}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
        <Button disabled={isLoading} type="submit">
          {isLoading ? <Spinner /> : <IconRefresh />}
          Change email
        </Button>
      </div>
    </form>
  )
}
