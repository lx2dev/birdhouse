"use client"

import {
  IconArrowUpRight,
  IconChevronDown,
  IconFileSettings,
  IconLogout,
  IconSettings,
  IconShield,
  IconSunMoon,
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api/client"
import { authClient, useSession } from "@/lib/auth/client"

interface UserMenuProps {
  children?: React.ReactElement
  variant?: "default" | "sidebarMenuButton" | "avatar"
}

export function UserMenu({ children, variant = "default" }: UserMenuProps) {
  const router = useRouter()
  const mobile = useIsMobile()
  const utils = api.useUtils()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  const isAdmin = isUserAdmin(session)

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
    setTheme(theme === "light" ? "dark" : "light")
    updatePreferences.mutate({
      theme: theme === "light" ? "dark" : "light",
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
        nativeButton={variant !== "avatar" || !!children}
        render={
          variant === "avatar" ? (
            <Avatar className="size-8" suppressHydrationWarning>
              <AvatarImage
                alt={profile.name}
                src={profile.image ?? undefined}
              />
              <AvatarFallback className="text-sm capitalize">
                {shortUserName}
              </AvatarFallback>
            </Avatar>
          ) : variant === "sidebarMenuButton" ? (
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  alt={profile.name}
                  src={profile.image ?? undefined}
                />
                <AvatarFallback className="rounded-lg">
                  {shortUserName}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profile.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {profile.email}
                </span>
              </div>
              <IconChevronDown className="ml-auto size-4" />
            </SidebarMenuButton>
          ) : (
            children
          )
        }
      />
      <DropdownMenuContent align="end" className="min-w-56 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-8">
                <AvatarImage
                  alt={profile.name}
                  src={profile.image ?? undefined}
                />
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
            render={<Link href="/settings" />}
          >
            <IconSettings />
            Settings
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href="/admin" />}
            >
              <IconShield />
              Admin Panel
            </DropdownMenuItem>
          )}
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
          <DropdownMenuShortcut>D</DropdownMenuShortcut>
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
