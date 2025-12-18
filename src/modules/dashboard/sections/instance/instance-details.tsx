"use client"

import {
  IconActivity,
  IconCpu,
  IconDatabase,
  IconExclamationCircleFilled,
  IconPointFilled,
  IconServer,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import type { RouterOutputs } from "@/lib/api/client"
import type {
  OperatingSystemTable,
  VMTable,
  VMTemplateTable,
} from "@/server/db/schema"

interface InstanceDetailsSectionProps {
  instance: VMTable & {
    os: OperatingSystemTable
    template: VMTemplateTable
  }
  status: RouterOutputs["compute"]["getInstanceStatus"]
}

export function InstanceDetailsSection({
  instance,
  status,
}: InstanceDetailsSectionProps) {
  return (
    <Suspense fallback={<InstanceDetailsSection.Skeleton />}>
      <ErrorBoundary fallback={<InstanceDetailsSection.Error />}>
        <InstanceDetailsSectionSuspense instance={instance} status={status} />
      </ErrorBoundary>
    </Suspense>
  )
}

function InstanceDetailsSectionSuspense({
  instance,
  status,
}: InstanceDetailsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconServer className="size-5" />
            Instance Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Template</p>
            <p className="font-medium">
              {instance.template.displayName || "Unknown"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <IconCpu className="size-4 text-muted-foreground" />
            <span className="flex items-center gap-1">
              {instance.cpuCores} {instance.cpuCores === 1 ? "Core" : "Cores"}
              <IconPointFilled className="size-3" />
              {(instance.memoryMb / 1024).toFixed(1)} GB RAM
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconDatabase className="size-4 text-muted-foreground" />
            <span>{instance.diskGb} GB Storage</span>
          </div>
          {instance.ipv4Address && (
            <div>
              <p className="text-muted-foreground text-sm">IPv4 Address</p>
              <p className="font-mono">{instance.ipv4Address}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-sm">Created</p>
            <p>
              {formatDistanceToNow(new Date(instance.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="size-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status ? (
            <>
              <div>
                <p className="text-muted-foreground text-sm">CPU Usage</p>
                <p className="font-bold text-2xl">
                  {(status.cpuUsage * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Memory Usage</p>
                <p className="font-bold text-2xl">
                  {((status.memoryUsed / status.memoryTotal) * 100).toFixed(1)}%
                </p>
                <p className="text-muted-foreground text-xs">
                  {(status.memoryUsed / 1024 / 1024 / 1024).toFixed(2)} GB /{" "}
                  {(status.memoryTotal / 1024 / 1024 / 1024).toFixed(2)} GB
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Uptime</p>
                <p className="font-medium text-lg">
                  {Math.floor(status.uptime / 86400)}d{" "}
                  {Math.floor((status.uptime % 86400) / 3600)}h{" "}
                  {Math.floor((status.uptime % 3600) / 60)}m
                </p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Performance data unavailable
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

InstanceDetailsSection.Skeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconServer className="size-5" />
          Instance Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconActivity className="size-5" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
    </Card>
  </div>
)

InstanceDetailsSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Error Loading Instance Details</EmptyTitle>
      <EmptyDescription>
        There was an error loading the instance details. Please try again later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
