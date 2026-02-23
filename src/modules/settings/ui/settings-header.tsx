"use client"

import type { UserWithRole } from "better-auth/plugins"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SETTINGS_NAV_ITEMS } from "@/constants"
import { Notifications } from "@/modules/dashboard/ui/notifications"
import { UserMenu } from "@/modules/dashboard/ui/user-menu"

interface SettingsHeaderProps {
  user: UserWithRole
}

export function SettingsHeader({ user }: SettingsHeaderProps) {
  const pathname = usePathname()

  const title = SETTINGS_NAV_ITEMS.find(({ href }) => href === pathname)?.title

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            {title && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Notifications />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
