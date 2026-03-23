"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconPlus, IconUserPlus } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { api } from "@/lib/api/client"
import { adminCreateUserSchema } from "@/modules/settings/schemas/account"

export function CreateUserModal() {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: (
          <>
            <IconPlus /> Add User
          </>
        ),
        variant: "default",
      }}
    >
      <CreateUserForm setOpen={setOpen} />
    </ResponsiveModal>
  )
}

interface CreateUserFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function CreateUserForm({ setOpen }: CreateUserFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof adminCreateUserSchema>>({
    defaultValues: {
      approved: true,
      email: "",
      emailVerified: false,
      name: "",
      role: "user",
    },
    resolver: zodResolver(adminCreateUserSchema),
  })

  const createUser = api.admin.users.insertOne.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("User created successfully")
      utils.admin.users.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(values: z.infer<typeof adminCreateUserSchema>) {
    createUser.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = createUser.isPending || isSubmitting

  return (
    <form
      className="space-y-6 px-8 md:p-0"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                disabled={isLoading}
                id={field.name}
                placeholder="Enter the user's name"
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                disabled={isLoading}
                id={field.name}
                placeholder="Enter the user's email"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="approved"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Approved</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Switch
                aria-invalid={fieldState.invalid}
                checked={field.value}
                disabled={isLoading}
                id={field.name}
                name={field.name}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="emailVerified"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Email Verified</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Switch
                aria-invalid={fieldState.invalid}
                checked={field.value}
                disabled={isLoading}
                id={field.name}
                name={field.name}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="role"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Role</FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Select
              disabled={isLoading}
              name={field.name}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger aria-invalid={fieldState.invalid} id={field.name}>
                <SelectValue
                  className="capitalize"
                  placeholder="Select a role"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <p className="text-muted-foreground text-sm">
        A password reset email will be sent to the user, allowing them to set
        their own password.
      </p>

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
          {isLoading ? <Spinner /> : <IconUserPlus />}
          Create User
        </Button>
      </div>
    </form>
  )
}
