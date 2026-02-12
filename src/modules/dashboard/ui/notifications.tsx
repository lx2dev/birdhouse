"use client"

import {
  IconArchive,
  IconBell,
  IconInbox,
  IconSettings,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import {
  getNotificationStatusColor,
  getNotificationStatusIcon,
} from "@/modules/dashboard/lib/utils"
import type { Notification } from "@/server/db/schema"

export function Notifications() {
  const { data } = api.notification.list.useQuery({ limit: 1 })

  const hasUnread = data?.items?.some((n) => !n.read) ?? false
  const length = data?.items?.filter((n) => !n.read).length || 0

  return (
    <Popover>
      <PopoverTrigger
        className="relative"
        render={<Button size="icon-lg" variant="ghost" />}
      >
        <span className="sr-only">Notifications</span>
        <IconBell className="size-5" />
        {hasUnread && (
          <div className="absolute top-1.5 right-1.5 flex size-2.5 text-xs">
            <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        alignOffset={-48}
        className="h-125 w-100 overflow-y-auto p-0"
        sideOffset={16}
      >
        <Suspense fallback={<Notifications.Skeleton length={length} />}>
          <ErrorBoundary fallback={<Notifications.Error />}>
            <NotificationsSuspense />
          </ErrorBoundary>
        </Suspense>
      </PopoverContent>
    </Popover>
  )
}

function NotificationsSuspense() {
  const [data, query] = api.notification.list.useSuspenseInfiniteQuery(
    { limit: 5 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const notifications = data.pages.flatMap((page) => page.items)

  return (
    <Tabs className="flex h-full flex-col" defaultValue="inbox">
      <div className="flex items-center justify-between border-b px-3">
        <TabsList className="gap-4 py-0" variant="line">
          <TabsTrigger
            className={cn(
              "box-border cursor-pointer rounded-none border-x-0 border-t-0 border-b-2 px-0.5 py-1.5 text-base data-active:border-b-foreground!",
            )}
            value="inbox"
          >
            Inbox
          </TabsTrigger>
          <TabsTrigger
            className={cn(
              "box-border cursor-pointer rounded-none border-x-0 border-t-0 border-b-2 px-0.5 py-1.5 text-base data-active:border-b-foreground!",
            )}
            value="archive"
          >
            Archive
          </TabsTrigger>
        </TabsList>

        <Button
          className="text-muted-foreground hover:text-foreground"
          nativeButton={false}
          render={<Link href="/settings/notifications" />}
          size="icon"
          variant="ghost"
        >
          <IconSettings className="size-5" />
        </Button>
      </div>

      <TabsContent value="inbox">
        {notifications.filter((n) => !n.read).length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia className="size-12 rounded-full" variant="icon">
                  <IconInbox className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No new notifications</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <>
            <ItemGroup className="gap-0 overflow-y-auto">
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
            </ItemGroup>
            <InfiniteScroll
              fetchNextPage={query.fetchNextPage}
              hasNextPage={query.hasNextPage}
              isFetchingNextPage={query.isFetchingNextPage}
            />
          </>
        )}
      </TabsContent>
      <TabsContent value="archive">
        {notifications.filter((n) => n.read).length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia className="size-12 rounded-full" variant="icon">
                  <IconArchive className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No archived notifications</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <>
            <ItemGroup className="gap-0 overflow-y-auto">
              {notifications
                .filter((n) => n.read)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
            </ItemGroup>
            <InfiniteScroll
              fetchNextPage={query.fetchNextPage}
              hasNextPage={query.hasNextPage}
              isFetchingNextPage={query.isFetchingNextPage}
            />
          </>
        )}
      </TabsContent>
    </Tabs>
  )
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { id, message, status, read } = notification

  const utils = api.useUtils()

  const markAsRead = api.notification.markAsRead.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      utils.notification.list.invalidate()
    },
  })

  return (
    <Item
      className="rounded-none border-x-0 border-t-0 border-b-border last:border-b-0"
      key={id}
      // TODO:
      // render={<Link href={`/settings/notifications/${id}`} />}
      variant="default"
    >
      <ItemMedia
        className={cn(
          "size-9 rounded-full bg-muted-foreground/10 text-muted-foreground",
          getNotificationStatusColor(status),
        )}
      >
        {(() => {
          const Icon = getNotificationStatusIcon(status)
          return <Icon className="size-5" />
        })()}
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-2">{message}</ItemTitle>
        <ItemDescription className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </ItemDescription>
      </ItemContent>

      {!read && (
        <ItemContent className="flex-none text-center">
          <Button
            className="z-10"
            disabled={markAsRead.isPending}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              markAsRead.mutate({ id })
            }}
            size="icon-xs"
            variant="outline"
          >
            {markAsRead.isPending ? <Spinner /> : <IconArchive />}
          </Button>
        </ItemContent>
      )}
    </Item>
  )
}

Notifications.Skeleton = ({ length }: { length: number }) => (
  <Tabs className="flex h-full flex-col" defaultValue="inbox">
    <div className="flex items-center justify-between border-b px-3">
      <TabsList className="gap-4 py-0" variant="line">
        <TabsTrigger
          className={cn(
            "box-border cursor-pointer rounded-none border-x-0 border-t-0 border-b-2 px-0.5 py-1.5 text-base data-active:border-b-foreground!",
          )}
          disabled
          value="inbox"
        >
          Inbox
        </TabsTrigger>
        <TabsTrigger
          className={cn(
            "box-border cursor-pointer rounded-none border-x-0 border-t-0 border-b-2 px-0.5 py-1.5 text-base data-active:border-b-foreground!",
          )}
          disabled
          value="archive"
        >
          Archive
        </TabsTrigger>
      </TabsList>

      <Button
        className="text-muted-foreground hover:text-foreground"
        disabled
        size="icon"
        variant="ghost"
      >
        <IconSettings className="size-5" />
      </Button>
    </div>

    <TabsContent value="inbox">
      {[...Array(length)].map((_, i) => (
        <ItemGroup className="gap-0 overflow-y-auto" key={i}>
          <Item className="rounded-none border-x-0 border-t-0 border-b-border last:border-b-0">
            <ItemMedia>
              <Skeleton className="size-9 rounded-full" />
            </ItemMedia>
            <ItemContent>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </ItemContent>
          </Item>
        </ItemGroup>
      ))}
    </TabsContent>
  </Tabs>
)

Notifications.Error = () => (
  <div className="flex h-full items-center justify-center p-4">
    <Empty>
      <EmptyHeader>
        <EmptyMedia className="size-12 rounded-full" variant="icon">
          <IconBell className="size-6 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>Failed to load notifications</EmptyTitle>
      </EmptyHeader>
    </Empty>
  </div>
)
