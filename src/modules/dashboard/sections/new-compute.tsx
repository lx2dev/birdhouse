"use client"

import { IconExclamationCircleFilled } from "@tabler/icons-react"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { NewInstanceForm } from "@/modules/dashboard/ui/new-compute/form"
import { NewInstanceDrawer } from "@/modules/dashboard/ui/new-compute/new-instance-drawer"
import type { CreationPhase } from "@/modules/dashboard/ui/new-compute/types"
import type { InstanceInsert } from "@/server/db/schema"

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
  const [creationPhase, setCreationPhase] =
    React.useState<CreationPhase>("idle")
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)
  const [createdInstance, setCreatedInstance] = React.useState<Pick<
    InstanceInsert,
    "id" | "name" | "sshKeyId"
  > | null>(null)

  return (
    <>
      <NewInstanceForm
        createdInstance={createdInstance}
        creationPhase={creationPhase}
        drawerOpen={drawerOpen}
        setCreatedInstance={setCreatedInstance}
        setCreationPhase={setCreationPhase}
        setDrawerOpen={setDrawerOpen}
      />
      <NewInstanceDrawer
        createdInstance={createdInstance}
        creationPhase={creationPhase}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  )
}

NewComputeSection.Skeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-46 w-full rounded-lg" />
    <Skeleton className="h-90 w-full rounded-lg" />
    <Skeleton className="h-35 w-full rounded-lg" />
    <Skeleton className="h-29 w-full rounded-lg" />
    <Skeleton className="h-9 w-35 rounded-lg" />
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
