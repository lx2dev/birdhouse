"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconCalendar,
  IconDeviceFloppy,
  IconEdit,
  IconFileUploadFilled,
} from "@tabler/icons-react"
import { formatDate } from "date-fns"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import type { UserWithVMCount } from "@/modules/admin/sections/users-table/columns"
import { UserBanCalendar } from "@/modules/admin/ui/user-ban-calendar"
import { adminUpdateUserSchema } from "@/modules/settings/schemas/account"

interface EditUserModalProps {
  user: UserWithVMCount
}

export function EditUserModal({ user }: EditUserModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsiveModal
      className="max-md:min-h-full"
      onOpenChange={setOpen}
      open={open}
      trigger={
        <DropdownMenuItem closeOnClick={false}>
          <IconEdit />
          Update user
        </DropdownMenuItem>
      }
    >
      <EditUserForm setOpen={setOpen} user={user} />
    </ResponsiveModal>
  )
}

interface EditUserFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  user: UserWithVMCount
}

function EditUserForm({ setOpen, user }: EditUserFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof adminUpdateUserSchema>>({
    defaultValues: {
      approved: user.approved,
      banExpires: user.banExpires,
      banned: user.banned,
      banReason: user.banReason ?? "",
      email: user.email,
      emailVerified: user.emailVerified,
      id: user.id,
      image: user.image,
      name: user.name,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    },
    resolver: zodResolver(adminUpdateUserSchema),
  })

  const updateUser = api.admin.users.update.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("User updated successfully")
      void utils.admin.users.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(values: z.infer<typeof adminUpdateUserSchema>) {
    updateUser.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = updateUser.isPending || isSubmitting

  return (
    <form
      className="space-y-6 px-8 md:p-0"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="image"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Profile Image URL</FieldLabel>

            <input type="hidden" {...field} value={field.value || ""} />

            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>

              {/* TODO: Implement */}

              <Button
                disabled={isLoading}
                id={field.name}
                onClick={() => alert("Not implemented yet")}
                variant="outline"
              >
                <IconFileUploadFilled />
                Upload
              </Button>

              <Button
                className="text-destructive hover:bg-destructive/20 hover:text-destructive focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30"
                disabled={isLoading}
                onClick={() => alert("Not implemented yet")}
                variant="ghost"
              >
                Remove
              </Button>
            </div>
            <FieldDescription className="text-xs">
              JPG or PNG. Max file size: 5MB.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                checked={field.value ?? false}
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
                checked={field.value ?? false}
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
          name="twoFactorEnabled"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>
                  Two-Factor Authentication
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Switch
                aria-invalid={fieldState.invalid}
                checked={field.value ?? false}
                disabled={isLoading || !user.twoFactorEnabled}
                id={field.name}
                name={field.name}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="banned"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Banned</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Switch
                aria-invalid={fieldState.invalid}
                checked={field.value ?? false}
                disabled={isLoading}
                id={field.name}
                name={field.name}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="banReason"
          render={({ field, fieldState }) => {
            const banReasonValue = field.value ?? ""

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Ban Reason</FieldLabel>
                <Textarea
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="resize-none"
                  disabled={isLoading || !form.watch("banned")}
                  id={field.name}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="Enter the reason for the ban"
                  ref={field.ref}
                  value={banReasonValue}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )
          }}
        />
        <Controller
          control={form.control}
          name="banExpires"
          render={({ field, fieldState }) => {
            const banExpiresDate =
              field.value instanceof Date
                ? field.value
                : field.value
                  ? new Date(field.value)
                  : null

            const hasValidBanExpiresDate =
              banExpiresDate !== null && !Number.isNaN(banExpiresDate.getTime())

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Ban Expires</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    disabled={isLoading || !form.watch("banned")}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      const value = event.target.value
                      field.onChange(value ? new Date(value) : null)
                    }}
                    placeholder="YYYY-MM-DD"
                    readOnly
                    ref={field.ref}
                    value={
                      hasValidBanExpiresDate
                        ? formatDate(banExpiresDate, "yyyy-MM-dd")
                        : ""
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <InputGroupButton
                            aria-label="Open calendar"
                            disabled={isLoading || !form.watch("banned")}
                            size="icon-xs"
                            variant="ghost"
                          />
                        }
                      >
                        <IconCalendar />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <UserBanCalendar
                          initialDate={
                            hasValidBanExpiresDate ? banExpiresDate : undefined
                          }
                          onDateChange={(date) => {
                            field.onChange(date ?? null)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )
          }}
        />
      </div>

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
          {isLoading ? <Spinner /> : <IconDeviceFloppy />}
          Save changes
        </Button>
      </div>
    </form>
  )
}
