import { IconBell, IconHome } from "@tabler/icons-react"
import Link from "next/link"

import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NAV_ITEMS } from "@/constants"

export function AppSidebar() {
  // TODO: Implement notifications
  const notifications = [
    { id: 1, message: "New login from unknown device", read: false },
    { id: 2, message: "Your password was changed successfully", read: true },
    { id: 3, message: "New SSH key added", read: false },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="mx-4 border-b px-0 py-0">
        <div className="flex items-center gap-2">
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="inline font-semibold text-lg md:text-2xl">
            Birdhouse
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link href="/">
                      <IconHome />
                      <span>Home</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>

              {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
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
      </SidebarFooter>
    </Sidebar>
  )
}
