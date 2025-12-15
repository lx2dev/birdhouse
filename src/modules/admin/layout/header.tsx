"use client"

import {
  IconLayoutDashboard,
  IconLogout,
  IconServer2,
  IconServerCog,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/client"

const NAV_ITEMS = [
  { href: "/admin", icon: IconLayoutDashboard, label: "Admin" },
  { href: "/admin/users", icon: IconUsers, label: "Users" },
  { href: "/admin/vms", icon: IconServer2, label: "Virtual Machines" },
  { href: "/admin/templates", icon: IconServerCog, label: "Templates" },
]

export function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/auth/signin")
        },
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="flex h-12 items-center gap-4 px-4 md:h-16 lg:px-8">
        <Link className="flex items-center gap-2" href="/admin">
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="hidden font-semibold text-lg sm:inline md:text-2xl">
            Birdhouse
          </span>
        </Link>

        <nav className="ml-8 hidden flex-1 items-center gap-1 sm:flex">
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
          <Button onClick={handleSignOut} size="sm" variant="outline">
            <IconLogout />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
