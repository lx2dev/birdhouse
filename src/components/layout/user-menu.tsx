"use client"

import { IconBadge, IconBell, IconLogout, IconUser } from "@tabler/icons-react"
import type { UserWithRole } from "better-auth/plugins"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { authClient } from "@/lib/auth/client"

interface UserMenuProps {
  user: UserWithRole
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const mobile = useIsMobile()

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/auth/signin")
        },
      },
    })
  }

  // TODO: Implement notifications
  const notifications = [
    { id: 1, message: "New login from unknown device", read: false },
    { id: 2, message: "Your password was changed successfully", read: true },
    { id: 3, message: "New SSH key added", read: false },
  ]

  const shortUserName = user.name
    ? mobile
      ? user.name.split(" ")[0][0]
      : user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={false}
        render={
          <div className="relative" suppressHydrationWarning>
            <Avatar className="size-8" suppressHydrationWarning>
              <AvatarImage alt={user.name} src={user.image ?? ""} />
              <AvatarFallback className="text-sm">
                {shortUserName}
              </AvatarFallback>
            </Avatar>
            {notifications.some((n) => !n.read) && (
              <div className="absolute top-0 right-0 flex size-2.5 text-xs">
                <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
              </div>
            )}
          </div>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-8">
                <AvatarImage alt={user.name} src={user.image ?? ""} />
                <AvatarFallback className="text-sm">
                  {shortUserName}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link href="/profile">
                <IconUser />
                Account
              </Link>
            }
          />

          <DropdownMenuItem
            render={
              <Link className="justify-between" href="/notifications">
                <span className="flex items-center gap-1.5">
                  <IconBell />
                  Notifications
                </span>
                {notifications.some((n) => !n.read) && (
                  <Badge className="size-5 bg-primary/10 text-primary focus-visible:ring-primary/20 dark:bg-primary/20 dark:focus-visible:ring-primary/40 [a]:hover:bg-primary/20">
                    {notifications.filter((n) => !n.read).length}
                  </Badge>
                )}
              </Link>
            }
          />

          {user.role === "admin" && (
            <DropdownMenuItem
              render={
                <Link href="/admin">
                  <IconBadge />
                  Admin
                </Link>
              }
            />
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut} variant="destructive">
            <IconLogout />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
