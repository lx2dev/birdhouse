"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { SETTINGS_NAV_ITEMS } from "@/constants"

export function SettingsSidebar() {
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname()

  function navigate() {
    setOpenMobile(false)
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-4 py-6">
        <span className="inline font-bold text-lg leading-tight md:text-2xl">
          Settings
        </span>
        <p className="text-muted-foreground text-sm">
          Manage your account and preferences.
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SETTINGS_NAV_ITEMS.map(({ href, icon: Icon, label }) => (
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
      </SidebarContent>
    </Sidebar>
  )
}
