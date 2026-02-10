"use client"

import {
  IconArchive,
  IconBell,
  IconInbox,
  IconSettings,
} from "@tabler/icons-react"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import {
  getNotificationStatusColor,
  getNotificationStatusIcon,
} from "@/modules/dashboard/lib/utils"
import type { Notification } from "@/server/db/schema"

export function Notifications() {
  return (
    <Suspense fallback={<Notifications.Skeleton />}>
      <ErrorBoundary fallback={<Notifications.Error />}>
        <NotificationsSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function NotificationsSuspense() {
  const [data, query] = api.notification.list.useSuspenseInfiniteQuery(
    { limit: 5 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const notifications = data.pages.flatMap((page) => page.items)

  return (
    <Popover>
      <PopoverTrigger
        className="relative"
        render={<Button size="icon-lg" variant="ghost" />}
      >
        <span className="sr-only">Notifications</span>
        <IconBell className="size-5" />
        {notifications.some((n) => !n.read) && (
          <div className="absolute top-1.5 right-1.5 flex size-2.5 text-xs">
            <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        alignOffset={-48}
        className="h-125 w-100 overflow-y-auto p-0"
        sideOffset={16}
      >
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
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { id, message, status, read } = notification

  return (
    <Item
      className="rounded-none border-x-0 border-t-0 border-b-border last:border-b-0"
      key={id}
      //   render={<Link href={`/settings/notifications/${id}`} />}
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
          Just now
        </ItemDescription>
      </ItemContent>

      {!read && (
        <ItemContent className="flex-none text-center">
          <Button
            className="z-10"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            size="icon-xs"
            variant="outline"
          >
            <IconArchive />
          </Button>
        </ItemContent>
      )}
    </Item>
  )
}

Notifications.Skeleton = () => (
  <div className="animate-pulse">
    <Tabs className="flex items-center justify-between border-b px-3">
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
    </Tabs>

    <div className="space-y-2 p-3">
      {[...Array(5)].map((_, i) => (
        <div className="flex items-center gap-3" key={i}>
          <div className="size-9 rounded-full bg-muted-foreground/10" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-full rounded bg-muted-foreground/10" />
            <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  </div>
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
