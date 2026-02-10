"use client"

import { IconLogout } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { ADMIN_NAV_ITEMS, NAV_ITEMS } from "@/constants"
import { useSession } from "@/lib/auth/client"

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { data: session } = useSession()
  const isAdmin = session?.user.role === "admin"

  const isAdminPath = pathname.startsWith("/admin")

  function navigate() {
    setOpenMobile(false)
  }

  return (
    <Sidebar>
      <SidebarHeader className="mx-4 px-0 py-0">
        <div className="flex items-center gap-2">
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="inline font-semibold text-lg md:text-2xl">
            Birdhouse
          </span>
        </div>
      </SidebarHeader>

      <div className="mx-4">
        <SidebarSeparator className="mx-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    onClick={navigate}
                    render={
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <div className="mx-4">
              <SidebarSeparator className="mx-auto" />
            </div>

            <SidebarGroup>
              <div className="flex items-center justify-between">
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                {isAdminPath && (
                  <Link href="/dashboard">
                    <Badge
                      className="text-[10px] text-foreground!"
                      variant="ghost"
                    >
                      <IconLogout />
                      Exit Admin
                    </Badge>
                  </Link>
                )}
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ADMIN_NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        onClick={navigate}
                        render={
                          <Link href={href}>
                            <Icon />
                            <span>{label}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={navigate}
              render={
                <Link href="/notifications">
                  <IconBell />
                  <span>Notifications</span>
                  {notifications.some((n) => !n.read) && (
                    <Badge className="ml-auto size-5 bg-primary/10 text-primary focus-visible:ring-primary/20 dark:bg-primary/20 dark:focus-visible:ring-primary/40 [a]:hover:bg-primary/20">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  )}
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  )
}
