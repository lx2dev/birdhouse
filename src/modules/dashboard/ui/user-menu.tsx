"use client"

import {
  IconArrowUpRight,
  IconFileSettings,
  IconLogout,
  IconSunMoon,
  IconUserFilled,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { toast } from "sonner"

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
  const utils = api.useUtils()
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

  const updatePreferences = api.userPreferences.update.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess({ preferences }) {
      utils.userPreferences.getAll.setData(undefined, preferences)
      void utils.userPreferences.getAll.invalidate()
      setTheme(preferences.theme)
    },
  })

  function toggleTheme() {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
    updatePreferences.mutate({
      theme: resolvedTheme === "light" ? "dark" : "light",
    })
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
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/docs" target="_blank" />}
          >
            <IconFileSettings />
            Docs
            <IconArrowUpRight className="-mt-1 -ml-1 size-3" />
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
