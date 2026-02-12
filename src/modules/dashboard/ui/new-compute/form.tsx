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
import { Spinner } from "@/components/ui/spinner"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { createComputeSchema } from "@/modules/dashboard/schemas"
import { CreateSSHKeyDialog } from "@/modules/dashboard/ui/create-ssh-key-dialog"
import type { InstanceInsert } from "@/server/db/schema"

import type { CreationPhase } from "./types"

const PROVISION_POLL_INTERVAL = 3000

interface NewInstanceFormProps {
  creationPhase: CreationPhase
  setCreationPhase: React.Dispatch<React.SetStateAction<CreationPhase>>
  drawerOpen: boolean
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  createdInstance: Pick<InstanceInsert, "id" | "name" | "sshKeyId"> | null
  setCreatedInstance: React.Dispatch<
    React.SetStateAction<Pick<
      InstanceInsert,
      "id" | "name" | "sshKeyId"
    > | null>
  >
}

export function NewInstanceForm(props: NewInstanceFormProps) {
  const {
    creationPhase,
    setCreationPhase,
    drawerOpen,
    setDrawerOpen,
    createdInstance,
    setCreatedInstance,
  } = props

  const router = useRouter()
  const utils = api.useUtils()

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
  const isFormLocked =
    isSubmitting ||
    creationPhase === "creating" ||
    creationPhase === "provisioning"

  const [templates] = api.template.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )
  const [sshKeys] = api.sshKey.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )
  const [operatingSystems] = api.os.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const createCompute = api.compute.create.useMutation({
    onError(error) {
      setCreationPhase("error")
      setDrawerOpen(true)
      toast.error("Failed to create compute instance:", {
        description: error.message,
      })
    },
    onSuccess(data) {
      setCredentials(data.credentials)
      setShowCredentials(true)
      setCreatedInstance({
        id: data.compute.id,
        name: data.compute.name,
        sshKeyId: data.compute.sshKeyId,
      })
      setCreationPhase("provisioning")
      setDrawerOpen(true)
      toast.success("Compute instance created successfully!")
      form.reset()
      utils.notification.list.invalidate()
    },
  })

  const instanceQuery = api.compute.getInstance.useQuery(
    { id: createdInstance?.id ?? "" },
    {
      enabled: Boolean(createdInstance?.id),
      refetchInterval: (state) =>
        state.state.data && state.state.data.status === "provisioning"
          ? PROVISION_POLL_INTERVAL
          : false,
    },
  )

  async function onSubmit(data: z.infer<typeof createComputeSchema>) {
    setCreationPhase("creating")
    setDrawerOpen(true)
    await createCompute.mutateAsync(data)
  }

  React.useEffect(() => {
    if (!instanceQuery.data?.status || !createdInstance?.id) return

    if (instanceQuery.data.status === "running") {
      setCreationPhase("complete")
      toast.success("Redirecting to instance details...")
      const timeout = setTimeout(() => {
        router.push(`/dashboard/compute/${createdInstance.id}`)
      }, 1200)
      return () => clearTimeout(timeout)
    }

    if (instanceQuery.data.status === "error") {
      setCreationPhase("error")
    }
  }, [
    instanceQuery.data?.status,
    createdInstance?.id,
    router,
    setCreationPhase,
  ])

  return (
    <form
      className={cn(
        "transition-opacity duration-300",
        drawerOpen && "opacity-60",
      )}
      onSubmit={form.handleSubmit(onSubmit)}
    >
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
                      disabled={isFormLocked}
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
                            disabled={isFormLocked}
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
                                isFormLocked && "cursor-not-allowed opacity-50",
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
                                  disabled={isFormLocked}
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
                  <FieldLegend variant="label">
                    Choose Operating System
                  </FieldLegend>
                  <FieldDescription>
                    Select an operating system for your instance
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
                            disabled={isFormLocked}
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
                                isFormLocked && "cursor-not-allowed opacity-50",
                              )}
                              htmlFor={os.id}
                            >
                              <Field orientation="horizontal">
                                <FieldContent className="space-y-3">
                                  <div>
                                    <FieldLabel className="capitalize">
                                      {os.osType}
                                    </FieldLabel>
                                    <FieldDescription>
                                      {os.displayName} {os.osVersion}
                                    </FieldDescription>
                                  </div>
                                </FieldContent>
                                <RadioGroupItem
                                  disabled={isFormLocked}
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
                    <ButtonGroup>
                      <Select
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          className="w-0 flex-1"
                          disabled={
                            isFormLocked ||
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
                                </span>
                                <span className="truncate text-muted-foreground">
                                  ({selectedKey.fingerprint})
                                </span>
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
                                </span>
                                <span className="truncate text-muted-foreground!">
                                  ({key.fingerprint})
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <CreateSSHKeyDialog>
                        <Button
                          className="text-foreground"
                          disabled={isFormLocked}
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
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isFormLocked} type="submit">
              {isSubmitting || creationPhase === "creating" ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : creationPhase === "provisioning" ? (
                <>
                  <Spinner />
                  Provisioning...
                </>
              ) : (
                <>
                  <IconPlus />
                  Create Instance
                </>
              )}
            </Button>
            {creationPhase !== "idle" && !drawerOpen && (
              <Button
                onClick={() => setDrawerOpen(true)}
                type="button"
                variant="ghost"
              >
                Show progress
              </Button>
            )}
          </div>
        </Field>
      </FieldGroup>
    </form>
  )
}
