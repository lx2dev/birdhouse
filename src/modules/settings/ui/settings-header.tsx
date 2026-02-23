"use client"

import { IconMenu2, IconMenuDeep } from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { SETTINGS_NAV_ITEMS } from "@/constants"
import { cn } from "@/lib/utils"
import { Notifications } from "@/modules/dashboard/ui/notifications"
import { UserMenu } from "@/modules/dashboard/ui/user-menu"

export function SettingsHeader() {
  const pathname = usePathname()
  const { openMobile, toggleSidebar } = useSidebar()

  const title = SETTINGS_NAV_ITEMS.find((item) => item.href === pathname)?.title

  return (
    <header className="@container flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="@md:block hidden">
              <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            {title && (
              <>
                <BreadcrumbSeparator className="@md:block hidden" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Notifications />
          <UserMenu />

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
