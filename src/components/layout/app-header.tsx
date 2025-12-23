"use client"

import { IconKey, IconPlus, IconServer2 } from "@tabler/icons-react"
import type { UserWithRole } from "better-auth/plugins"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Icons } from "@/components/icons"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { href: "/dashboard", icon: IconServer2, label: "Dashboard" },
  { href: "/dashboard/new", icon: IconPlus, label: "Create" },
  { href: "/dashboard/ssh-keys", icon: IconKey, label: "SSH Keys" },
]

interface AppHeaderProps {
  user: UserWithRole
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="flex h-12 items-center gap-4 px-4 md:h-16 lg:px-8">
        <Link className="flex items-center gap-2" href="/dashboard">
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="hidden font-semibold text-lg md:inline lg:text-2xl">
            Birdhouse
          </span>
        </Link>

        <nav className="ml-8 hidden flex-1 items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href

            return (
              <Link href={href} key={href}>
                <Button
                  className="gap-2"
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                >
                  <Icon />
                  {label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
