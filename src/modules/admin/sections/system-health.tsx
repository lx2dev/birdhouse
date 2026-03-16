// TODO: Implement system health metrics from Proxmox

"use client"

import {
  IconAlertTriangle,
  IconExclamationCircleFilled,
} from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/modules/admin/ui/status-badge"

export function SystemHealthSection() {
  return (
    <Suspense fallback={<SystemHealthSection.Skeleton />}>
      <ErrorBoundary fallback={<SystemHealthSection.Error />}>
        {/* <SystemHealthSection.Skeleton /> */}
        <SystemHealthSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const metrics = [
  {
    name: "CPU Usage",
    status: "running" as const,
    value: 67,
  },
  {
    name: "Memory Usage",
    status: "running" as const,
    value: 54,
  },
  {
    name: "Storage",
    status: "running" as const,
    value: 78,
  },
  {
    name: "Network I/O",
    status: "running" as const,
    value: 42,
  },
]

const services = [
  { name: "API Gateway", status: "running" as const },
  { name: "Database Cluster", status: "running" as const },
  { name: "Message Queue", status: "running" as const },
  { name: "Backup Service", status: "provisioning" as const },
]

function SystemHealthSuspense() {
  return (
    <Card className="@container h-full">
      <div className="px-4">
        <Alert variant="warning">
          <IconAlertTriangle />
          <AlertTitle>Mock System Health Alert</AlertTitle>
          <AlertDescription>
            This data is mocked for demo purposes. Real metrics and WIP.
          </AlertDescription>
        </Alert>
      </div>

      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Infrastructure status and metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div className="space-y-2" key={metric.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric.name}</span>
                <span className="font-medium text-foreground">
                  {metric.value}%
                </span>
              </div>
              <Progress
                aria-label={`${metric.name}: ${metric.value}%`}
                className="h-2"
                value={metric.value}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-foreground text-sm">Services</h4>
          <div className="space-y-2">
            {services.map((service) => (
              <div
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                key={service.name}
              >
                <span className="text-foreground text-sm">{service.name}</span>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

SystemHealthSection.Skeleton = () => (
  <Card className="@container h-full">
    <CardHeader>
      <CardTitle>System Health</CardTitle>
      <CardDescription>Infrastructure status and metrics</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        {[...Array(4)].map((_, idx) => (
          <div className="space-y-2" key={idx}>
            <div className="flex items-center justify-between text-sm">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/6" />
            </div>
            <Skeleton className="h-2" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-foreground text-sm">Services</h4>
        <div className="space-y-2">
          {[...Array(4)].map((_, idx) => (
            <div
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
              key={idx}
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

SystemHealthSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle className="text-base">
        Unable to load system health data
      </EmptyTitle>
      <EmptyDescription>
        Please check your connection or try again later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
