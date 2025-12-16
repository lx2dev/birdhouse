"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconCpu,
  IconDatabase,
  IconPlus,
  IconPointFilled,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { createComputeSchema } from "@/modules/dashboard/schemas"
import { CreateSSHKeyDialog } from "@/modules/dashboard/ui/create-ssh-key-dialog"

export function NewComputeSection() {
  return (
    <Suspense fallback={<NewComputeSection.Skeleton />}>
      <ErrorBoundary fallback={<NewComputeSection.Error />}>
        <NewComputeSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function NewComputeSectionSuspense() {
  const router = useRouter()

  const [_credentials, setCredentials] = React.useState<{
    username: string
    password: string
  } | null>(null)
  const [_showCredentials, setShowCredentials] = React.useState<boolean>(false)

  const form = useForm({
    defaultValues: {
      name: "",
      operatingSystemId: "",
      sshKeyId: "",
      templateId: "",
    },
    resolver: zodResolver(createComputeSchema),
  })

  const { isSubmitting } = form.formState

  const [templates] = api.template.list.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_FETCH_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )
  const [sshKeys] = api.sshKey.list.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_FETCH_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )
  const [operatingSystems] = api.os.list.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_FETCH_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const createCompute = api.compute.create.useMutation({
    onError(error) {
      toast.error("Failed to create compute instance:", {
        description: error.message,
      })
    },
    onSuccess(data) {
      setCredentials(data.credentials)
      setShowCredentials(true)
      toast.success("Compute instance created successfully!")
      form.reset()
      router.push(`/dashboard/compute/${data.compute.id}`)
    },
  })

  async function onSubmit(data: z.infer<typeof createComputeSchema>) {
    await createCompute.mutateAsync(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Card>
          <CardContent>
            <FieldSet>
              <FieldLegend>Instance Details</FieldLegend>
              <FieldDescription>Name your instance</FieldDescription>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Instance Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      id={field.name}
                      placeholder="web-server-01"
                    />
                    <FieldDescription>
                      Use only lowercase letters, numbers, and hyphens
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Controller
              control={form.control}
              name="templateId"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Choose Template</FieldLegend>
                  <FieldDescription>
                    Select compute resources for your instance
                  </FieldDescription>
                  {templates.pages.flatMap((page) => page.items).length ===
                  0 ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No templates available</EmptyTitle>
                      </EmptyHeader>
                      <EmptyContent>
                        <p className="text-center text-muted-foreground text-sm">
                          There are no instance templates available. Please
                          contact support for assistance.
                        </p>
                      </EmptyContent>
                    </Empty>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {templates.pages
                        .flatMap((page) => page.items)
                        .map((template) => (
                          <RadioGroup
                            aria-invalid={fieldState.invalid}
                            disabled={isSubmitting}
                            key={template.id}
                            name={field.name}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FieldLabel
                              className={cn(
                                "border-2 transition-colors",
                                field.value === template.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50",
                                isSubmitting && "cursor-not-allowed opacity-50",
                              )}
                              htmlFor={template.id}
                            >
                              <Field orientation="horizontal">
                                <FieldContent className="space-y-3">
                                  <div>
                                    <FieldLabel>
                                      {template.displayName}
                                    </FieldLabel>
                                    {template.description && (
                                      <FieldDescription>
                                        {template.description}
                                      </FieldDescription>
                                    )}
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <IconCpu className="size-4" />
                                      <span>
                                        {template.cpuCores}{" "}
                                        {template.cpuCores === 1
                                          ? "Core"
                                          : "Cores"}
                                      </span>
                                      <IconPointFilled className="size-2.5" />
                                      <span>
                                        {(template.memoryMb / 1024).toFixed(1)}{" "}
                                        GB RAM
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <IconDatabase className="size-4" />
                                      <span>{template.diskGb} GB Storage</span>
                                    </div>
                                  </div>
                                </FieldContent>
                                <RadioGroupItem
                                  disabled={isSubmitting}
                                  id={template.id}
                                  value={template.id}
                                />
                              </Field>
                            </FieldLabel>
                          </RadioGroup>
                        ))}
                    </div>
                  )}

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Controller
              control={form.control}
              name="operatingSystemId"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Choose Template</FieldLegend>
                  <FieldDescription>
                    Select compute resources for your instance
                  </FieldDescription>
                  {operatingSystems.pages.flatMap((page) => page.items)
                    .length === 0 ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No templates available</EmptyTitle>
                      </EmptyHeader>
                      <EmptyContent>
                        <p className="text-center text-muted-foreground text-sm">
                          There are no instance templates available. Please
                          contact support for assistance.
                        </p>
                      </EmptyContent>
                    </Empty>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {operatingSystems.pages
                        .flatMap((page) => page.items)
                        .map((os) => (
                          <RadioGroup
                            aria-invalid={fieldState.invalid}
                            disabled={isSubmitting}
                            key={os.id}
                            name={field.name}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FieldLabel
                              className={cn(
                                "border-2 transition-colors",
                                field.value === os.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50",
                                isSubmitting && "cursor-not-allowed opacity-50",
                              )}
                              htmlFor={os.id}
                            >
                              <Field orientation="horizontal">
                                <FieldContent className="space-y-3">
                                  <div>
                                    <FieldLabel>{os.displayName}</FieldLabel>
                                    <FieldDescription>
                                      {os.osType} {os.osVersion}
                                    </FieldDescription>
                                  </div>
                                </FieldContent>
                                <RadioGroupItem
                                  disabled={isSubmitting}
                                  id={os.id}
                                  value={os.id}
                                />
                              </Field>
                            </FieldLabel>
                          </RadioGroup>
                        ))}
                    </div>
                  )}

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Controller
              control={form.control}
              name="sshKeyId"
              render={({ field, fieldState }) => {
                const selectedKey = sshKeys.pages
                  .flatMap((page) => page.items)
                  .find((k) => k.id === field.value)

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Select SSH Key
                      </FieldLabel>
                      <FieldDescription>
                        Select an existing SSH key or create a new one
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <ButtonGroup className="w-full">
                      <Select
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          className="flex-1"
                          disabled={
                            isSubmitting ||
                            sshKeys.pages.flatMap((page) => page.items)
                              .length === 0
                          }
                          id={field.name}
                        >
                          <SelectValue>
                            {selectedKey ? (
                              <>
                                <span className="font-semibold">
                                  {selectedKey.name}
                                </span>{" "}
                                ({selectedKey.fingerprint})
                              </>
                            ) : (
                              "Select an SSH key"
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {sshKeys.pages
                            .flatMap((page) => page.items)
                            .map((key) => (
                              <SelectItem key={key.id} value={key.id}>
                                <span className="font-semibold">
                                  {key.name}
                                </span>{" "}
                                ({key.fingerprint})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <CreateSSHKeyDialog>
                        <Button
                          className="text-foreground"
                          disabled={isSubmitting}
                          type="button"
                          variant="outline"
                        >
                          <IconPlus />
                        </Button>
                      </CreateSSHKeyDialog>
                    </ButtonGroup>
                  </Field>
                )
              }}
            />
          </CardContent>
        </Card>

        <Field orientation="horizontal">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Spinner />
                Creating...
              </>
            ) : (
              <>
                <IconPlus />
                Create Instance
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

NewComputeSection.Skeleton = function NewComputeSectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-46 w-full rounded-(--radius)" />
      <Skeleton className="h-90 w-full rounded-(--radius)" />
      <Skeleton className="h-35 w-full rounded-(--radius)" />
      <Skeleton className="h-29 w-full rounded-(--radius)" />
      <Skeleton className="h-9 w-35 rounded-(--radius)" />
    </div>
  )
}

NewComputeSection.Error = function NewComputeSectionError() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Unable to Load Compute Instance Templates</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <p className="text-center text-muted-foreground text-sm">
          There was an error loading compute instance templates. Please try
          refreshing the page.
        </p>
      </EmptyContent>
    </Empty>
  )
}
