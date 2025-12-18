"use client"

import {
  IconExclamationCircleFilled,
  IconPlayerPlayFilled,
  IconRefresh,
  IconSquareFilled,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
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
  return (
    <div className="flex flex-wrap gap-2">
      <ButtonGroup>
        <Button
          className="gap-2"
          // disabled={vm.status === "running" || startMutation.isPending}
          // onClick={() => startMutation.mutate({ id: vmId })}
          variant="outline"
        >
          <IconPlayerPlayFilled />
          Start
        </Button>
        <Button
          className="gap-2 bg-transparent"
          // disabled={vm.status === "stopped" || stopMutation.isPending}
          // onClick={() => stopMutation.mutate({ id: vmId })}
          variant="outline"
        >
          <IconSquareFilled />
          Stop
        </Button>
        <Button
          className="gap-2 bg-transparent"
          // disabled={vm.status !== "running" || rebootMutation.isPending}
          // onClick={() => rebootMutation.mutate({ id: vmId })}
          variant="outline"
        >
          <IconRefresh />
          Reboot
        </Button>
      </ButtonGroup>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button className="ml-auto gap-2" variant="destructive">
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
            <AlertDialogCancel>
              <IconX /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              // onClick={() => deleteMutation.mutate({ id: vmId })}
            >
              <IconTrash /> Delete
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
