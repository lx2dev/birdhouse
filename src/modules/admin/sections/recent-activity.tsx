"use client"

import { IconExclamationCircleFilled } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { InfiniteScroll } from "@/components/infinite-scroll"
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
import { DEFAULT_FETCH_LIMIT } from "@/constants"
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
  const [data, query] = api.admin.getRecentActivity.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const activity = data.pages.flatMap((page) => page.items)

  return (
    <Card className="@container pb-0">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100svh-31rem)] pr-4">
          <div className="relative space-y-4">
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

            <InfiniteScroll
              className="absolute right-0 -bottom-10 left-0 z-10"
              fetchNextPage={query.fetchNextPage}
              hasNextPage={query.hasNextPage}
              isFetchingNextPage={query.isFetchingNextPage}
              isManual
            />

            {query.hasNextPage && (
              <div className="absolute right-0 bottom-0 left-0 h-20 bg-linear-to-t from-card to-transparent" />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

RecentActivitySection.Skeleton = () => (
  <Card className="@container pb-0">
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Latest actions across the platform</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[calc(100svh-31rem)] pr-4">
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
