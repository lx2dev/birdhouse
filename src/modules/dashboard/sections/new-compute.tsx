"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconCheck,
  IconCpu,
  IconDatabase,
  IconExclamationCircleFilled,
  IconPlus,
  IconPointFilled,
  IconX,
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
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

type CreationPhase = "idle" | "creating" | "provisioning" | "complete" | "error"
type StepStatus = "done" | "in-progress" | "pending" | "error"

const PROVISION_POLL_INTERVAL = 3000

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
  const utils = api.useUtils()

  const [_credentials, setCredentials] = React.useState<{
    username: string
    password: string
  } | null>(null)
  const [_showCredentials, setShowCredentials] = React.useState<boolean>(false)
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)
  const [creationPhase, setCreationPhase] =
    React.useState<CreationPhase>("idle")
  const [createdInstance, setCreatedInstance] = React.useState<{
    id: string
    name: string
    sshKeyId?: string | null
  } | null>(null)

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
      const timeout = setTimeout(() => {
        router.push(`/dashboard/compute/${createdInstance.id}`)
      }, 1200)
      return () => clearTimeout(timeout)
    }

    if (instanceQuery.data.status === "error") {
      setCreationPhase("error")
    }
  }, [createdInstance?.id, instanceQuery.data?.status, router])

  const steps = getProvisionSteps({
    creationPhase,
    hasSshKey: Boolean(createdInstance?.sshKeyId),
  })

  const drawerDescription = createdInstance
    ? `Provisioning ${createdInstance.name}`
    : "Preparing your new instance"

  return (
    <>
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
                      <FieldLabel htmlFor={field.name}>
                        Instance Name
                      </FieldLabel>
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
                                  isFormLocked &&
                                    "cursor-not-allowed opacity-50",
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
                                          {(template.memoryMb / 1024).toFixed(
                                            1,
                                          )}{" "}
                                          GB RAM
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <IconDatabase className="size-4" />
                                        <span>
                                          {template.diskGb} GB Storage
                                        </span>
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
                                  isFormLocked &&
                                    "cursor-not-allowed opacity-50",
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

      <Drawer
        onOpenChange={(open) => {
          if (open) return
          setDrawerOpen(false)
        }}
        open={drawerOpen}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader className="border-border border-b px-0 text-left!">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <DrawerTitle>Provisioning Console</DrawerTitle>
                  <DrawerDescription>{drawerDescription}</DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button size="sm" variant="ghost">
                    <IconX className="size-4" />
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="space-y-4 pt-4 pb-6">
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="font-semibold text-sm">Status</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-foreground/90 px-2.5 py-1 font-mono text-[11px] text-background">
                    {getStatusLabel(creationPhase)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {getStatusDetail(creationPhase)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
                <p className="font-semibold text-sm">Provisioning steps</p>
                <div className="space-y-3">
                  {steps.map((step) => (
                    <StepRow
                      description={step.description}
                      key={step.id}
                      status={step.status}
                      title={step.title}
                    />
                  ))}
                </div>
              </div>

              {creationPhase === "error" && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                  <p className="font-semibold text-destructive text-sm">
                    Provisioning paused
                  </p>
                  <p className="mt-1 text-destructive/80 text-xs">
                    Something went wrong while creating your instance. You can
                    close this drawer, adjust your settings, and try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

NewComputeSection.Skeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-46 w-full rounded-(--radius)" />
    <Skeleton className="h-90 w-full rounded-(--radius)" />
    <Skeleton className="h-35 w-full rounded-(--radius)" />
    <Skeleton className="h-29 w-full rounded-(--radius)" />
    <Skeleton className="h-9 w-35 rounded-(--radius)" />
  </div>
)

NewComputeSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Unable to Load Compute Instance Templates</EmptyTitle>
      <EmptyDescription>
        There was an error loading compute instance templates. Please try
        refreshing the page.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)

interface StepRowProps {
  title: string
  description: string
  status: StepStatus
}

function StepRow({ title, description, status }: StepRowProps) {
  return (
    <div
      className={cn("flex items-start gap-3", getStepRowStatusClass(status))}
    >
      <div className="mt-0.5 flex size-5 items-center justify-center">
        {status === "done" && <IconCheck className="size-4" />}
        {status === "in-progress" && <Spinner className="size-4" />}
        {status === "error" && (
          <IconExclamationCircleFilled className="size-4 text-destructive" />
        )}
        {status === "pending" && (
          <IconPointFilled className="size-3 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  )
}

interface ProvisionStepProps {
  creationPhase: CreationPhase
  hasSshKey: boolean
}

function getProvisionSteps({ creationPhase, hasSshKey }: ProvisionStepProps) {
  const steps: Array<{
    id: string
    title: string
    description: string
    status: StepStatus
  }> = [
    {
      description: "We queued your instance request.",
      id: "start",
      status:
        creationPhase === "creating" ||
        creationPhase === "provisioning" ||
        creationPhase === "complete" ||
        creationPhase === "error"
          ? "done"
          : "pending",
      title: "Creation started",
    },
    {
      description: "Cloning the template in the background.",
      id: "base",
      status:
        creationPhase === "provisioning"
          ? "in-progress"
          : creationPhase === "complete"
            ? "done"
            : creationPhase === "error"
              ? "error"
              : "pending",
      title: "Preparing base image",
    },
    {
      description: hasSshKey
        ? "SSH key will be added for secure login."
        : "No SSH key selected. Password login will be ready.",
      id: "access",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Setting up access",
    },
    {
      description: "Login information is being prepared.",
      id: "user",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Saving user details",
    },
    {
      description: "Booting the VM on the host.",
      id: "boot",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Starting instance",
    },
    {
      description: "Redirecting you to the instance page.",
      id: "done",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Creation complete",
    },
  ]

  return steps
}

function getStatusLabel(creationPhase: CreationPhase) {
  switch (creationPhase) {
    case "creating":
      return "Creation started"
    case "provisioning":
      return "Provisioning"
    case "complete":
      return "Complete"
    case "error":
      return "Needs attention"
    default:
      return "Idle"
  }
}

function getStatusDetail(creationPhase: CreationPhase) {
  switch (creationPhase) {
    case "creating":
      return "Submitting your request to the cluster."
    case "provisioning":
      return "This can take a few minutes."
    case "complete":
      return "Taking you to your new instance."
    case "error":
      return "Review the form and try again."
    default:
      return "Ready when you are."
  }
}

function getStepRowStatusClass(status: StepStatus) {
  switch (status) {
    case "done":
      return "opacity-100 text-green-500"
    case "in-progress":
      return "opacity-100 text-primary"
    case "error":
      return "opacity-100 text-destructive"
    case "pending":
      return "opacity-50 text-foreground"
  }
}
