"use client"

import { IconLogout, IconSunMoon, IconUserFilled } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { api } from "@/lib/api/client"
import { authClient } from "@/lib/auth/client"

export function UserMenu() {
  const router = useRouter()
  const mobile = useIsMobile()
  const { resolvedTheme, setTheme } = useTheme()

  const [profile] = api.account.getProfile.useSuspenseQuery()

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

  const shortUserName = profile.name
    ? mobile
      ? profile.name.split(" ")[0][0]
      : profile.name
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
            <AvatarImage alt={profile.name} src={profile.image ?? ""} />
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
                <AvatarImage alt={profile.name} src={profile.image ?? ""} />
                <AvatarFallback className="text-sm capitalize">
                  {shortUserName}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profile.name}</span>
                <span className="truncate text-xs">{profile.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/settings/account/profile" />}
          >
            <IconUserFilled />
            Account
          </DropdownMenuItem>
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
