"use client"

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconExclamationCircleFilled,
} from "@tabler/icons-react"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"

export function AdminMetricsSection() {
  const [stats] = api.admin.getStats.useSuspenseQuery()

  function getPercentChange(current: number, previous: number) {
    if (previous <= 0) {
      return {
        isPositive: current >= 0,
        value: current > 0 ? 100 : 0,
      }
    }

    const delta = ((current - previous) / previous) * 100
    return {
      isPositive: delta >= 0,
      value: Number(Math.abs(delta).toFixed(1)),
    }
  }

  const metrics: MetricItemProps[] = [
    {
      change: getPercentChange(
        stats.users.newLast24hCount,
        stats.users.newPrev24hCount,
      ),
      label: "Total Users",
      value: stats.userCount,
    },
    {
      change: getPercentChange(
        stats.vms.newLast24hCount,
        stats.vms.newPrev24hCount,
      ),
      label: "Total VMs",
      value: stats.vmCount,
    },
    {
      label: "Templates",
      value: stats.templateCount,
    },
    {
      label: "OS Images",
      value: stats.osCount,
    },
  ]

  const alerts: AlertItemProps[] = [
    {
      href: "/admin/users?filter=pending",
      label: "pending approvals",
      status: "warning",
      value: stats.users.pendingApprovalCount,
    },
    {
      href: "/admin/logs",
      label: "unread alerts",
      status: "destructive",
      value: stats.notifications.unreadAlertCount,
    },
    {
      href: "/admin/logs",
      label: "audit events (24h)",
      status: "success",
      value: stats.audit.last24hCount,
    },
  ]

  return (
    <Suspense
      fallback={
        <AdminMetricsSection.Skeleton alerts={alerts} metrics={metrics} />
      }
    >
      <ErrorBoundary fallback={<AdminMetricsSection.Error />}>
        <AdminMetricsSuspense alerts={alerts} metrics={metrics} />
      </ErrorBoundary>
    </Suspense>
  )
}

interface AdminMetricsSuspenseProps {
  metrics: MetricItemProps[]
  alerts: AlertItemProps[]
}

function AdminMetricsSuspense({ metrics, alerts }: AdminMetricsSuspenseProps) {
  return (
    <Card className="@container py-6">
      <div className="flex flex-wrap items-start gap-8 px-6">
        {metrics.map((metric, idx) => (
          <div className="flex items-start gap-8" key={metric.label}>
            <MetricItem {...metric} />
            {idx < metrics.length - 1 && (
              <Separator className="@md:block hidden" orientation="vertical" />
            )}
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      <div className="flex @md:flex-row flex-col flex-wrap @md:items-center gap-x-6 gap-y-2 px-6">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Status
        </span>
        <Separator className="@md:block hidden" orientation="vertical" />
        {alerts.map((alert) => (
          <AlertItem key={alert.label} {...alert} />
        ))}
      </div>
    </Card>
  )
}

interface MetricItemProps {
  label: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
}

function MetricItem({ label, value, change }: MetricItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-2xl text-foreground tabular-nums">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "flex items-center font-medium text-xs",
              change.isPositive ? "text-primary" : "text-destructive",
            )}
          >
            {change.isPositive ? (
              <IconArrowUpRight className="size-3" />
            ) : (
              <IconArrowDownRight className="size-3" />
            )}
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
    </div>
  )
}

type AlertStatus = "success" | "warning" | "destructive"

interface AlertItemProps {
  label: string
  value: string | number
  status: AlertStatus
  href: string
}

function AlertItem({ label, value, status, href }: AlertItemProps) {
  const dotColor: Record<AlertStatus, string> = {
    destructive: "bg-destructive",
    success: "bg-primary",
    warning: "bg-chart-2",
  }
  const valueColor: Record<AlertStatus, string> = {
    destructive: "text-destructive",
    success: "text-primary",
    warning: "text-chart-2",
  }

  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", dotColor[status])}
      />
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-semibold text-sm tabular-nums",
            valueColor[status],
          )}
        >
          {value}
        </span>
        <Link
          className="text-muted-foreground text-xs underline underline-offset-2 transition-colors hover:text-foreground/70"
          href={href}
        >
          {label}
        </Link>
      </div>
    </div>
  )
}

AdminMetricsSection.Skeleton = ({
  metrics,
  alerts,
}: AdminMetricsSuspenseProps) => (
  <Card className="@container">
    <div className="flex flex-wrap items-start gap-8 px-6 py-4">
      {metrics.map((metric, idx) => (
        <div className="flex items-start gap-8" key={metric.label}>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              {metric.label}
            </span>
            <Skeleton className="h-8 w-24" />
          </div>
          {idx < 3 && (
            <Separator className="@md:block hidden" orientation="vertical" />
          )}
        </div>
      ))}
    </div>

    <Separator />

    <div className="flex @md:flex-row flex-col flex-wrap @md:items-center gap-x-6 gap-y-2 px-6 py-2">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Status
      </span>
      <Separator className="@md:block hidden" orientation="vertical" />
      {alerts.map((alert) => (
        <div className="flex items-center gap-2" key={alert.label}>
          <Skeleton className="size-4 rounded-full" />
          <div className="flex items-baseline gap-2">
            <Link
              className="text-muted-foreground text-xs underline underline-offset-2"
              href={alert.href}
            >
              {alert.label}
            </Link>
          </div>
        </div>
      ))}
    </div>
  </Card>
)

AdminMetricsSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle className="text-base">Failed to load metrics</EmptyTitle>
      <EmptyDescription>
        There was an error fetching the latest metrics. Please try again later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
