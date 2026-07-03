"use client"

import {
  IconArchive,
  IconBell,
  IconInbox,
  IconSettings,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
import { useMediaQuery } from "@/hooks/use-media-query"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import {
  getNotificationStatusColor,
  getNotificationStatusIcon,
} from "@/modules/dashboard/lib/utils"
import type { Notification } from "@/server/db/schema"

export function Notifications() {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [open, setOpen] = React.useState(false)

  const { data } = api.notification.list.useQuery({ limit: 1 })

  const hasUnread = data?.items?.some((n) => !n.read) ?? false
  const length = data?.items?.filter((n) => !n.read).length || 0

  if (isDesktop) {
    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          className="relative"
          render={<Button size="icon-lg" variant="ghost" />}
        >
          <span className="sr-only">Notifications</span>
          <IconBell className="size-4" />
          {hasUnread && (
            <div className="absolute top-1.5 right-1.5 flex size-2.5 text-xs">
              <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent
          alignOffset={-48}
          className="h-125 w-100 p-0"
          sideOffset={16}
        >
          <Suspense fallback={<Notifications.Skeleton length={length} />}>
            <ErrorBoundary fallback={<Notifications.Error />}>
              <NotificationsSuspense setOpen={setOpen} />
            </ErrorBoundary>
          </Suspense>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger
        className="relative"
        render={
          <Button size="icon-lg" variant="ghost">
            <span className="sr-only">Notifications</span>
            <IconBell className="size-4" />
            {hasUnread && (
              <div className="absolute top-1.5 right-1.5 flex size-2.5 text-xs">
                <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              </div>
            )}
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader hidden>
          <DrawerTitle hidden />
        </DrawerHeader>

        <Suspense fallback={<Notifications.Skeleton length={length} />}>
          <ErrorBoundary fallback={<Notifications.Error />}>
            <NotificationsSuspense setOpen={setOpen} />
          </ErrorBoundary>
        </Suspense>
      </DrawerContent>
    </Drawer>
  )
}

interface NotificationsProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function NotificationsSuspense({ setOpen }: NotificationsProps) {
  const utils = api.useUtils()

  const [data, query] = api.notification.list.useSuspenseInfiniteQuery(
    { limit: 5 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const notifications = data.pages.flatMap((page) => page.items)

  const archiveAll = api.notification.archiveAll.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      void utils.notification.list.invalidate()
      void utils.admin.getRecentActivity.invalidate()
    },
  })

  return (
    <Tabs
      className="flex h-full flex-col max-md:min-h-[calc(65svh)]"
      defaultValue="inbox"
    >
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
          onClick={() => setOpen(false)}
          render={<Link href="/settings/notifications" />}
          size="icon"
          variant="ghost"
        >
          <IconSettings className="size-5" />
        </Button>
      </div>

      <TabsContent className="overflow-y-auto" value="inbox">
        {notifications.filter((n) => !n.read).length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia className="size-12 rounded-full" variant="icon">
                <IconInbox className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No new notifications</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ItemGroup className="gap-0">
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => setOpen(false)}
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
      <TabsContent className="overflow-y-auto" value="archive">
        {notifications.filter((n) => n.read).length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia className="size-12 rounded-full" variant="icon">
                <IconArchive className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No archived notifications</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ItemGroup className="gap-0">
              {notifications
                .filter((n) => n.read)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => setOpen(false)}
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

      {notifications.filter((n) => !n.read).length > 0 && (
        <div className="flex justify-end border-t px-3 py-1.5">
          <Button
            className="text-muted-foreground hover:text-foreground"
            disabled={archiveAll.isPending}
            onClick={() => archiveAll.mutate()}
            size="sm"
            variant="ghost"
          >
            <IconArchive /> Archive all
          </Button>
        </div>
      )}
    </Tabs>
  )
}

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { id, message, status, read } = notification

  const utils = api.useUtils()

  const archive = api.notification.archive.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      void utils.notification.list.invalidate()
      void utils.admin.getRecentActivity.invalidate()
    },
  })

  return (
    <Item
      className="group rounded-none border-x-0 border-t-0 border-b-border last:border-b-0"
      key={id}
      onClick={onClick}
      render={<Link href={`/notifications/${id}`} />}
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
            className={cn(
              "z-10",
              !archive.isPending &&
                "translate-x-1/2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
            )}
            disabled={archive.isPending}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              archive.mutate({ id })
            }}
            size="icon-xs"
            variant="outline"
          >
            {archive.isPending ? <Spinner /> : <IconArchive />}
          </Button>
        </ItemContent>
      )}
    </Item>
  )
}

Notifications.Skeleton = ({ length }: { length: number }) => (
  <Tabs
    className="flex h-full flex-col max-md:min-h-[calc(65svh)]"
    defaultValue="inbox"
  >
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
        <ItemGroup className="gap-0" key={i}>
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

    <div className="flex justify-end border-t px-3 py-1.5">
      <Button
        className="text-muted-foreground hover:text-foreground"
        disabled
        size="sm"
        variant="ghost"
      >
        <IconArchive /> Archive all
      </Button>
    </div>
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
