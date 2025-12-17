"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconDeviceFloppy, IconPencil, IconX } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import { updateVMTemplateSchema } from "@/modules/admin/schemas"
import type { VMTemplateTable } from "@/server/db/schema"

type EditTemplateDialogProps = React.ComponentProps<typeof Button> & {
  template: VMTemplateTable
}

export function EditTemplateDialog({
  template,
  ...props
}: EditTemplateDialogProps) {
  const utils = api.useUtils()

  const [open, setOpen] = React.useState<boolean>(false)

  const form = useForm({
    defaultValues: {
      cpuCores: template.cpuCores,
      description: template.description ?? undefined,
      diskGb: template.diskGb,
      displayName: template.displayName,
      id: template.id,
      memoryMb: template.memoryMb,
      status: template.status,
    },
    resolver: zodResolver(updateVMTemplateSchema),
  })

  const isSubmitting = form.formState.isSubmitting

  React.useEffect(() => {
    if (open) {
      form.reset({
        cpuCores: template.cpuCores,
        description: template.description ?? undefined,
        diskGb: template.diskGb,
        displayName: template.displayName,
        id: template.id,
        memoryMb: template.memoryMb,
        status: template.status,
      })
    }
  }, [open, template, form])

  const updateTemplate = api.admin.template.update.useMutation({
    onError(error) {
      toast.error("Failed to update VM Template:", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("VM Template updated successfully")
      utils.template.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  async function onSubmit(data: z.infer<typeof updateVMTemplateSchema>) {
    await updateTemplate.mutateAsync(data)
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button
            className="flex-1 gap-2 bg-transparent"
            size="sm"
            variant="outline"
            {...props}
          >
            <IconPencil />
            Edit
          </Button>
        }
      />
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit VM Template: {template.displayName}</DialogTitle>
          <DialogDescription>
            Modify the details of the VM Template below. Changes will take
            effect immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <FieldGroup>
              <Controller
                control={form.control}
                name="displayName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      id={field.name}
                      placeholder="Standard Small"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="min-h-30 resize-none"
                      disabled={isSubmitting}
                      id={field.name}
                      placeholder="A short description of the template"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  control={form.control}
                  name="cpuCores"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>CPU Cores</FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                        id={field.name}
                        placeholder="2"
                        type="number"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="memoryMb"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Memory (MB)</FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                        id={field.name}
                        placeholder="2048"
                        type="number"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="diskGb"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Disk Size (GB)
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                        id={field.name}
                        placeholder="20"
                        type="number"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  disabled={isSubmitting}
                  onClick={() => form.reset()}
                  type="button"
                  variant="outline"
                >
                  <IconX /> Cancel
                </Button>
              }
            />
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
