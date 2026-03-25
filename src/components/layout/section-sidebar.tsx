"use client"

import {
  IconArrowUpRight,
  IconChevronRight,
  IconLayoutDashboard,
  IconSettings,
  IconShield,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import type { NavSection } from "@/constants"
import { APP_NAME, isNavItemActive } from "@/constants"
import { Notifications } from "@/modules/dashboard/ui/notifications"
import { UserMenu } from "@/modules/dashboard/ui/user-menu"

interface SectionSidebarProps {
  sections: NavSection[]
  homeHref: string
  isAdmin?: boolean
}

export function SectionSidebar({
  isAdmin = false,
  homeHref,
  sections,
}: SectionSidebarProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  function navigate() {
    setOpenMobile(false)
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="py-0">
        <Link className="flex items-center gap-2" href={homeHref}>
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="inline font-semibold text-lg md:text-2xl">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>

      <Separator className="my-4" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="group/target text-muted-foreground data-active:bg-sidebar-accent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                  isActive={isNavItemActive(pathname, {
                    href: "/dashboard",
                    label: "",
                  })}
                  onClick={navigate}
                  render={<Link href="/dashboard" />}
                  size="lg"
                >
                  <IconLayoutDashboard className="text-muted-foreground" />
                  <span className="flex items-center gap-0.5 font-semibold text-lg">
                    Dashboard
                  </span>
                  <IconChevronRight className="ml-auto size-5!" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="group/target text-muted-foreground data-active:bg-sidebar-accent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                  isActive={isNavItemActive(pathname, {
                    href: "/settings",
                    label: "",
                  })}
                  onClick={navigate}
                  render={<Link href="/settings" />}
                  size="lg"
                >
                  <IconSettings className="text-muted-foreground" />
                  <span className="flex items-center gap-0.5 font-semibold text-lg">
                    Settings
                  </span>
                  <IconChevronRight className="ml-auto size-5!" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="group/target text-muted-foreground data-active:bg-sidebar-accent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                    isActive={isNavItemActive(pathname, {
                      href: "/admin",
                      label: "",
                    })}
                    onClick={navigate}
                    render={<Link href="/admin" />}
                    size="lg"
                  >
                    <IconShield className="text-muted-foreground" />
                    <span className="flex items-center gap-0.5 font-semibold text-lg">
                      Admin
                    </span>
                    <IconChevronRight className="ml-auto size-5!" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sections.map(({ items, key, label }) => {
          if (!items?.length) return null

          return (
            <React.Fragment key={key}>
              <SidebarGroup>
                <SidebarGroupLabel className="capitalize">
                  {label ?? key}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => {
                      const {
                        href,
                        icon: Icon,
                        label: itemLabel,
                        linkHref,
                        target,
                      } = item

                      return (
                        <SidebarMenuItem key={href}>
                          <SidebarMenuButton
                            className="group/target text-muted-foreground data-active:bg-sidebar-accent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                            isActive={isNavItemActive(pathname, item)}
                            onClick={navigate}
                            render={
                              <Link href={linkHref ?? href} target={target} />
                            }
                            size="lg"
                          >
                            <Icon className="text-muted-foreground" />
                            <span className="flex items-center gap-0.5 font-semibold text-lg">
                              {itemLabel}
                              {target === "_blank" && (
                                <IconArrowUpRight className="-mt-1 size-4! opacity-0 group-hover/target:opacity-100" />
                              )}
                            </span>
                          </SidebarMenuButton>

                          {item.children?.length ? (
                            <SidebarMenuSub className="ml-3">
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.href}>
                                  <SidebarMenuSubButton
                                    className="text-muted-foreground data-active:bg-transparent data-[size=md]:text-base data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-5"
                                    isActive={isNavItemActive(pathname, child)}
                                    onClick={navigate}
                                    render={
                                      <Link
                                        href={child.href}
                                        target={child.target}
                                      >
                                        {child.icon && (
                                          <child.icon className="text-muted-foreground!" />
                                        )}
                                        <span>{child.label}</span>
                                      </Link>
                                    }
                                  />
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          ) : null}
                        </SidebarMenuItem>
                      )
                    })}
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

      <SidebarFooter className="flex flex-row items-center">
        <UserDropdownMenu />
        <Notifications />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function UserDropdownMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu variant="sidebarMenuButton" />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
