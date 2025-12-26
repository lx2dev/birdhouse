"use client"

import { IconMenu2, IconMenuDeep } from "@tabler/icons-react"
import type { UserWithRole } from "better-auth/plugins"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { NAV_ITEMS } from "@/constants"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/modules/dashboard/ui/user-menu"

interface AppHeaderProps {
  user: UserWithRole
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const { openMobile, toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="flex h-12 items-center gap-4 px-4 md:h-16 lg:px-8">
        <Link className="flex items-center gap-2" href="/dashboard">
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="inline font-semibold text-lg md:text-2xl">
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

        <div className="ml-auto flex items-center gap-2">
          <UserMenu user={user} />

          <div className="block md:hidden">
            <Button
              className="relative"
              onClick={toggleSidebar}
              size="icon"
              variant="ghost"
            >
              <IconMenu2
                className={cn(
                  "size-6 transition-opacity duration-200",
                  openMobile ? "opacity-0" : "opacity-100",
                )}
              />
              <IconMenuDeep
                className={cn(
                  "absolute size-6 transition-opacity duration-200",
                  openMobile ? "opacity-100" : "opacity-0",
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
