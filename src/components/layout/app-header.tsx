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
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { getNavItemTitle, NAV_ITEMS } from "@/constants"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const pathname = usePathname()
  const { openMobile, toggleSidebar } = useSidebar()

  const getNavSection = (path: string) => {
    if (path.startsWith("/admin")) return NAV_ITEMS.admin
    if (path.startsWith("/settings")) return NAV_ITEMS.settings
    return NAV_ITEMS.platform
  }

  const navSection = getNavSection(pathname)
  const parentKey = pathname.split("/")[1]
  const parent = parentKey.charAt(0).toUpperCase() + parentKey.slice(1)
  const parentHref = `/${parentKey}`
  const title = getNavItemTitle(pathname, navSection.items)

  return (
    <header className="@container flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
        <Separator
          className="my-auto mr-2 hidden data-[orientation=vertical]:h-4 md:block"
          orientation="vertical"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={parentHref}>{parent}</BreadcrumbLink>
            </BreadcrumbItem>
            {title && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
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
