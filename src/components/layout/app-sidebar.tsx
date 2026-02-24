"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { Icons } from "@/components/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { NAV_ITEMS } from "@/constants"
import { useSession } from "@/lib/auth/client"

const navOrder = ["platform", "settings", "admin"] as const

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { data: session } = useSession()
  const isAdmin = session?.user.role === "admin"

  function navigate() {
    setOpenMobile(false)
  }

  if (!session) return <AppSidebar.Skeleton isAdmin={isAdmin} />

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="mx-4 px-0 py-0">
        <div className="flex items-center gap-2">
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="inline font-semibold text-lg md:text-2xl">
            Birdhouse
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navOrder.map((key) => {
          if (key === "admin" && !isAdmin) return null

          const items = NAV_ITEMS[key]?.items
          if (!items) return null

          return (
            <React.Fragment key={key}>
              <SidebarGroup>
                <SidebarGroupLabel className="capitalize">
                  {NAV_ITEMS[key]?.key}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map(({ href, icon: Icon, label }) => (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                          className="text-muted-foreground data-active:bg-transparent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                          isActive={pathname === href}
                          onClick={navigate}
                          render={<Link href={href} />}
                          size="lg"
                        >
                          <Icon />
                          <span className="font-semibold text-lg">{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="mx-4 last:hidden">
                <SidebarSeparator className="mx-auto" />
              </div>
            </React.Fragment>
          )
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

AppSidebar.Skeleton = ({ isAdmin }: { isAdmin: boolean }) => (
  <Sidebar variant="inset">
    <SidebarHeader className="mx-4 px-0 py-0">
      <div className="flex items-center gap-2">
        <Icons.logo className="size-12 text-primary md:size-16" />
        <span className="inline font-semibold text-lg md:text-2xl">
          Birdhouse
        </span>
      </div>
    </SidebarHeader>

    <SidebarContent>
      {navOrder.map((key) => {
        if (key === "admin" && !isAdmin) return null

        const items = NAV_ITEMS[key]?.items
        if (!items) return null

        return (
          <React.Fragment key={key}>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Skeleton className="h-4 w-16" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.from({ length: items.length }).map((_, itemIdx) => (
                    <SidebarMenuItem key={itemIdx}>
                      <SidebarMenuButton
                        className="text-muted-foreground data-active:bg-transparent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                        size="lg"
                      >
                        <Skeleton className="size-6" />
                        <Skeleton className="h-4 w-20" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mx-4 last:hidden">
              <SidebarSeparator className="mx-auto" />
            </div>
          </React.Fragment>
        )
      })}
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
)
