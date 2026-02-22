"use client"

import {
  IconBadge,
  IconLogout,
  IconSunMoon,
  IconUser,
} from "@tabler/icons-react"
import type { UserWithRole } from "better-auth/plugins"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const pathname = usePathname()
  const mobile = useIsMobile()
  const { resolvedTheme, setTheme } = useTheme()

  const isAdminPath = pathname.startsWith("/admin")

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/auth/signin")
        },
      },
    })
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }

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
          <Avatar className="size-8" suppressHydrationWarning>
            <AvatarImage alt={user.name} src={user.image ?? ""} />
            <AvatarFallback className="text-sm capitalize">
              {shortUserName}
            </AvatarFallback>
          </Avatar>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-8">
                <AvatarImage alt={user.name} src={user.image ?? ""} />
                <AvatarFallback className="text-sm capitalize">
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
            nativeButton={false}
            render={
              <Link href="/settings/account/profile">
                <IconUser />
                Account
              </Link>
            }
          />

          {user.role === "admin" && (
            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link href={isAdminPath ? "/dashboard" : "/admin"}>
                  <IconBadge />
                  {isAdminPath ? "Exit Admin" : "Admin Panel"}
                </Link>
              }
            />
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={toggleTheme}>
          <IconSunMoon />
          Toggle Theme
        </DropdownMenuItem>

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
