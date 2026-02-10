"use client"

import {
  IconArchive,
  IconBell,
  IconInbox,
  IconSettings,
} from "@tabler/icons-react"
import Link from "next/link"

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
import { cn } from "@/lib/utils"
import {
  getNotificationStatusColor,
  getNotificationStatusIcon,
} from "@/modules/dashboard/lib/utils"

type Notification = {
  id: number
  message: string
  status: "success" | "failure" | "info" | "alert"
  read: boolean
}

export function Notifications() {
  // TODO: Implement notifications
  const notifications: Notification[] = [
    {
      id: 1,
      message: "New login from unknown device",
      read: false,
      status: "alert",
    },
    {
      id: 2,
      message: "Your password was changed successfully",
      read: false,
      status: "success",
    },
    { id: 3, message: "New SSH key added", read: false, status: "info" },
    {
      id: 4,
      message:
        "Your account was accessed from a new location. If this wasn't you, please secure your account immediately. This is a very long message to test the line clamping functionality in the notification item component.",
      read: true,
      status: "alert",
    },
    {
      id: 5,
      message: "Your instance 'web-server-1' has been stopped",
      read: false,
      status: "failure",
    },
    {
      id: 6,
      message: "Your instance 'db-server-2' has been provisioned",
      read: true,
      status: "success",
    },
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 7,
      message: `Notification ${i + 7}`,
      read: Math.random() < 0.5,
      status: ["success", "failure", "info", "alert"][
        Math.floor(Math.random() * 4)
      ] as Notification["status"],
    })),
  ]

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

          <div className="overflow-y-auto">
            <TabsContent value="inbox">
              {notifications.filter((n) => !n.read).length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia
                        className="size-12 rounded-full"
                        variant="icon"
                      >
                        <IconInbox className="size-6 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>No new notifications</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : (
                <ItemGroup className="gap-0">
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
                      <EmptyMedia
                        className="size-12 rounded-full"
                        variant="icon"
                      >
                        <IconArchive className="size-6 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>No archived notifications</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : (
                <ItemGroup className="gap-0">
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
          </div>
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
