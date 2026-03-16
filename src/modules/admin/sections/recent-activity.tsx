"use client"

import { IconExclamationCircleFilled } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"

export function RecentActivitySection() {
  return (
    <Suspense fallback={<RecentActivitySection.Skeleton />}>
      <ErrorBoundary fallback={<RecentActivitySection.Error />}>
        <RecentActivitySuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function RecentActivitySuspense() {
  const [stats] = api.admin.getStats.useSuspenseQuery()

  const activity = [...stats.recentUserActivity, ...stats.recentVmActivity]

  return (
    <Card className="@container h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {activity.map((activity, idx) => (
              <div
                className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                key={idx}
              >
                <Avatar className="size-9">
                  <AvatarImage
                    alt={activity.userName}
                    src={activity.userImage || undefined}
                  />
                  <AvatarFallback className="bg-accent/20 text-accent text-xs">
                    {activity.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm">
                      {activity.userName}
                    </p>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {activity.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

RecentActivitySection.Skeleton = () => (
  <Card className="@container h-full">
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Latest actions across the platform</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(5)].map((_, idx) => (
          <div className="flex items-start gap-4 rounded-lg p-3" key={idx}>
            <Avatar className="size-9">
              <AvatarFallback className="bg-accent/20 text-accent text-xs" />
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/6" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

RecentActivitySection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle className="text-base">
        Failed to load recent activity
      </EmptyTitle>
      <EmptyDescription>
        There was an error fetching the recent activity data. Please try again
        later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
