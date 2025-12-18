"use client"

import {
  IconExclamationCircleFilled,
  IconPlayerPlayFilled,
  IconPower,
  IconRefresh,
  IconSquareFilled,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import type {
  OperatingSystemTable,
  VMTable,
  VMTemplateTable,
} from "@/server/db/schema"

interface InstanceControlsSectionProps {
  instance: VMTable & {
    os: OperatingSystemTable
    template: VMTemplateTable
  }
}

export function InstanceControlsSection({
  instance,
}: InstanceControlsSectionProps) {
  return (
    <Suspense fallback={<InstanceControlsSection.Skeleton />}>
      <ErrorBoundary fallback={<InstanceControlsSection.Error />}>
        <InstanceControlsSectionSuspense instance={instance} />
      </ErrorBoundary>
    </Suspense>
  )
}

function InstanceControlsSectionSuspense({
  instance,
}: InstanceControlsSectionProps) {
  const utils = api.useUtils()

  const [forceShutdown, setForceShutdown] = React.useState<boolean>(false)
  const [open, setOpen] = React.useState<{
    delete: boolean
    shutdown: boolean
  }>({
    delete: false,
    shutdown: false,
  })

  const startMutation = api.compute.start.useMutation({
    onError(error) {
      toast.error("Failed to start instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance started")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
    },
  })
  const shutdownMutation = api.compute.shutdown.useMutation({
    onError(error) {
      toast.error("Failed to shutdown instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance shutdown initiated")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
      setForceShutdown(false)
      setOpen((prev) => ({ ...prev, shutdown: false }))
    },
  })
  const stopMutation = api.compute.stop.useMutation({
    onError(error) {
      toast.error("Failed to stop instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance stopped")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
    },
  })
  const rebootMutation = api.compute.reboot.useMutation({
    onError(error) {
      toast.error("Failed to reboot instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance rebooted")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
    },
  })
  const deleteMutation = api.compute.delete.useMutation({
    onError(error) {
      toast.error("Failed to delete instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance deleted")
      utils.compute.list.invalidate()
      setOpen((prev) => ({ ...prev, delete: false }))
    },
  })

  return (
    <div className="flex flex-wrap gap-2">
      <ButtonGroup>
        <Button
          className="text-green-500"
          disabled={instance.status !== "stopped" || startMutation.isPending}
          onClick={() => startMutation.mutate({ id: instance.id })}
          variant="outline"
        >
          <IconPlayerPlayFilled
            className={startMutation.isPending ? "animate-pulse" : ""}
          />
          Start
        </Button>
        <AlertDialog
          onOpenChange={(isOpen) =>
            setOpen((prev) => ({ ...prev, shutdown: isOpen }))
          }
          open={open.shutdown}
        >
          <AlertDialogTrigger
            disabled={
              instance.status !== "running" || shutdownMutation.isPending
            }
            render={
              <Button
                className="text-yellow-500"
                disabled={
                  instance.status !== "running" || shutdownMutation.isPending
                }
                variant="outline"
              >
                <IconPower
                  className={shutdownMutation.isPending ? "animate-pulse" : ""}
                />
                Shutdown
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Shutdown Virtual Machine?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to shutdown this virtual machine? Unsaved
                data may be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Label className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-aria-checked:border-yellow-500/50 has-aria-checked:bg-yellow-500/10">
              <Checkbox
                className="data-checked:border-yellow-500 data-checked:bg-yellow-500 data-checked:text-white dark:data-checked:bg-yellow-500/80"
                onCheckedChange={(checked) => {
                  setForceShutdown(checked as boolean)
                }}
              />
              <div className="grid gap-1.5 font-normal">
                <p className="font-medium text-sm leading-none">
                  Force Shutdown (Hard Power Off)
                </p>
                <p className="text-muted-foreground text-sm">
                  Enabling this may lead to data loss or corruption.
                </p>
              </div>
            </Label>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={shutdownMutation.isPending}>
                <IconX /> Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-yellow-500 text-background"
                disabled={shutdownMutation.isPending}
                onClick={() =>
                  shutdownMutation.mutate({
                    force: forceShutdown,
                    id: instance.id,
                  })
                }
              >
                {shutdownMutation.isPending ? <Spinner /> : <IconPower />}
                Shutdown
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          className="text-destructive"
          disabled={instance.status !== "running" || stopMutation.isPending}
          onClick={() => stopMutation.mutate({ id: instance.id })}
          variant="outline"
        >
          <IconSquareFilled
            className={stopMutation.isPending ? "animate-pulse" : ""}
          />
          Stop
        </Button>
        <Button
          className="text-primary"
          disabled={instance.status !== "running" || rebootMutation.isPending}
          onClick={() => rebootMutation.mutate({ id: instance.id })}
          variant="outline"
        >
          <IconRefresh
            className={rebootMutation.isPending ? "animate-spin" : ""}
          />
          Reboot
        </Button>
      </ButtonGroup>

      <AlertDialog
        onOpenChange={(isOpen) =>
          setOpen((prev) => ({ ...prev, delete: isOpen }))
        }
        open={open.delete}
      >
        <AlertDialogTrigger
          disabled={deleteMutation.isPending}
          render={
            <Button
              className="ml-auto"
              disabled={deleteMutation.isPending}
              variant="destructive"
            >
              <IconTrash />
              Delete
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Virtual Machine?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              virtual machine and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              <IconX /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ id: instance.id })}
            >
              {deleteMutation.isPending ? <Spinner /> : <IconTrash />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

InstanceControlsSection.Skeleton = () => (
  <div className="flex flex-wrap gap-2">
    <Skeleton className="h-8 w-60" />
    <Skeleton className="ml-auto h-8 w-22" />
  </div>
)

InstanceControlsSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Error Loading Instance Controls</EmptyTitle>
      <EmptyDescription>
        There was an error loading the instance controls. Please try again
        later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
