"use client"

import type { UserWithRole } from "better-auth/plugins"
import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SETTINGS_NAV_ITEMS } from "@/constants"
import { UserMenu } from "@/modules/dashboard/ui/user-menu"

interface AccountHeaderProps {
  user: UserWithRole
}

export default function AccountHeader({ user }: AccountHeaderProps) {
  const pathname = usePathname()

  const title = SETTINGS_NAV_ITEMS.find(({ href }) => href === pathname)?.label

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 inline-flex md:hidden" />
        <Separator
          className="mx-2 inline-flex md:hidden"
          orientation="vertical"
        />
        <h1 className="font-medium text-base">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
