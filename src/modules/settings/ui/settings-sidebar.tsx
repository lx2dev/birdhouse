"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { SETTINGS_NAV_ITEMS } from "@/constants"
import { cn } from "@/lib/utils"

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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-muted-foreground data-active:bg-transparent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
              onClick={navigate}
              render={<Link href="/dashboard" />}
              size="lg"
            >
              <IconArrowLeft />
              <span className="font-semibold text-lg">Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="mt-4">
            <span className="text-muted-foreground text-sm">Need help?</span>{" "}
            <Link
              className={cn("p-0!", buttonVariants({ variant: "link" }))}
              href="/support"
            >
              Contact support
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
