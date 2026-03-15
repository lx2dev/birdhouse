"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconDeviceFloppy, IconPencil, IconTrash } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
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

interface EditTemplateDialogProps {
  template: VMTemplateTable
}

export function EditTemplateDialog({ template }: EditTemplateDialogProps) {
  const [open, setOpen] = React.useState<boolean>(false)

  return (
    <ResponsiveModal
      alert
      onOpenChange={setOpen}
      open={open}
      trigger={{
        children: (
          <>
            <IconPencil /> Edit
          </>
        ),
        className: "flex-1",
        size: "sm",
        variant: "outline",
      }}
    >
      <EditTemplateForm open={open} setOpen={setOpen} template={template} />
    </ResponsiveModal>
  )
}

interface EditTemplateFormProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  template: VMTemplateTable
}

function EditTemplateForm({ open, setOpen, template }: EditTemplateFormProps) {
  const utils = api.useUtils()

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
      utils.notification.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  const deleteTemplate = api.admin.template.delete.useMutation({
    onError(error) {
      toast.error("Failed to delete VM Template:", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("VM Template deleted successfully")
      utils.template.list.invalidate()
      utils.notification.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  async function onSubmit(data: z.infer<typeof updateVMTemplateSchema>) {
    await updateTemplate.mutateAsync(data)
  }

  function onDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this VM Template? This action cannot be undone.",
      )
    ) {
      return
    }
    deleteTemplate.mutate({ id: template.id })
  }

  const { isSubmitting } = form.formState
  const isLoading =
    updateTemplate.isPending || deleteTemplate.isPending || isSubmitting

  return (
    <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  <FieldLabel htmlFor={field.name}>Disk Size (GB)</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
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

      <div className="flex items-center justify-end gap-2">
        <Button
          className="mr-auto"
          disabled={isLoading}
          onClick={onDelete}
          variant="destructive"
        >
          {deleteTemplate.isPending ? <Spinner /> : <IconTrash />}
          Delete
        </Button>
        <Button
          disabled={isLoading}
          onClick={() => setOpen(false)}
          variant="ghost"
        >
          Cancel
        </Button>
        <Button disabled={isLoading} type="submit">
          {updateTemplate.isPending ? <Spinner /> : <IconDeviceFloppy />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
