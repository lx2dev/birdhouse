"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconDeviceFloppy, IconFileUploadFilled } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { RouterOutputs } from "@/lib/api/client"
import { api } from "@/lib/api/client"
import { userInsertSchema } from "@/modules/settings/schemas/account"

interface UpdateProfileModalProps {
  profile: RouterOutputs["account"]["getProfile"]
}

export function UpdateProfileModal({ profile }: UpdateProfileModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [open, setOpen] = React.useState(false)

  if (isDesktop) {
    return (
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger render={<Button variant="outline" />}>
          Update Profile
        </DialogTrigger>
        <DialogContent>
          <UpdateProfileForm profile={profile} setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button variant="outline">Update Profile</Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[75svh]">
        <DrawerHeader hidden>
          <DrawerTitle hidden />
        </DrawerHeader>
        <UpdateProfileForm profile={profile} setOpen={setOpen} />
      </DrawerContent>
    </Drawer>
  )
}

interface UpdateProfileFormProps {
  profile: RouterOutputs["account"]["getProfile"]
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const formSchema = userInsertSchema
  .pick({
    image: true,
    name: true,
  })
  .partial()

function UpdateProfileForm({ profile, setOpen }: UpdateProfileFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      image: profile.image ?? undefined,
      name: profile.name,
    },
    resolver: zodResolver(formSchema),
  })

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateUser.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = updateUser.isPending || isSubmitting

  return (
    <form
      className="space-y-8 px-8 md:p-0"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="image"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Profile Image</FieldLabel>

              <input type="hidden" {...field} value={field.value || ""} />

              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarImage src={field.value || ""} />
                  <AvatarFallback>{profile.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>

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

        <Separator />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <Input
                {...field}
                disabled={isLoading}
                id={field.name}
                placeholder="Your name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

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
          Save Changes
        </Button>
      </div>
    </form>
  )
}
