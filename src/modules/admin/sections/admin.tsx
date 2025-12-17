"use client"

import {
  IconActivityHeartbeat,
  IconClock,
  IconExclamationCircleFilled,
  IconServer,
  IconUsers,
} from "@tabler/icons-react"
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
import { api } from "@/lib/api/client"

export function AdminSection() {
  return (
    <Suspense fallback={<AdminSection.Skeleton />}>
      <ErrorBoundary fallback={<AdminSection.Error />}>
        {/* <AdminSection.Skeleton /> */}
        <AdminSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function AdminSectionSuspense() {
  const [stats] = api.admin.getStats.useSuspenseQuery()

  const STAT_CARDS = [
    {
      description: "Registered accounts",
      icon: IconUsers,
      title: "Total Users",
      value: stats.userCount,
    },
    {
      description: "Active virtual machine instances",
      icon: IconServer,
      title: "Virtual Machines",
      value: stats.vmCount,
    },
    {
      description: "Accounts awaiting review",
      icon: IconClock,
      title: "Pending Approvals",
      value: stats.pendingApprovalCount,
    },
    {
      description: "All systems operational",
      icon: IconActivityHeartbeat,
      title: "Systems Health",
      value: "Operational",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STAT_CARDS.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                {stat.title}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stat.value}</div>
              <p className="mt-1 text-muted-foreground text-xs">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

AdminSection.Skeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, idx) => (
      <Card key={idx}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    ))}
  </div>
)

AdminSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle className="text-base">Failed to load admin data.</EmptyTitle>
      <EmptyDescription>
        There was an error while fetching the admin statistics. Please try
        again.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
