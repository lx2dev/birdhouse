"use client"

import {
  IconArrowLeft,
  IconArrowUpRight,
  IconSettings,
  IconShieldCheck,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { Icons } from "@/components/icons"
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
import type { NAV_SECTIONS, NavSection } from "@/constants"
import { APP_NAME, isNavItemActive } from "@/constants"
import { UserMenu } from "@/modules/dashboard/ui/user-menu"

interface SectionSidebarProps {
  sections: NavSection[]
  homeHref: string
  sectionKey: (typeof NAV_SECTIONS)[number]["key"]
  isAdmin?: boolean
}

export function SectionSidebar({
  isAdmin = false,
  homeHref,
  sectionKey,
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

        {sectionKey !== "platform" && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="font-semibold [&_svg]:size-5"
                onClick={navigate}
                render={<Link href="/dashboard" />}
                size="lg"
                variant="outline"
              >
                <IconArrowLeft />
                <span className="font-semibold text-base">
                  Back to Platform
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>

      <SidebarContent>
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
                            <Icon />
                            <span className="flex items-center gap-0.5 font-semibold text-lg">
                              {itemLabel}
                              {target === "_blank" && (
                                <IconArrowUpRight className="-mt-1 size-4! opacity-0 group-hover/target:opacity-100" />
                              )}
                            </span>
                          </SidebarMenuButton>

                          {item.children?.length ? (
                            <SidebarMenuSub className="mx-0 mt-1 border-l-0 pl-6">
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.href}>
                                  <SidebarMenuSubButton
                                    className="h-8 rounded-md px-2 font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground data-active:bg-transparent data-active:font-semibold data-[size=md]:text-base data-active:text-foreground [&>svg]:size-5"
                                    isActive={isNavItemActive(pathname, child)}
                                    onClick={navigate}
                                    render={
                                      <Link
                                        href={child.href}
                                        target={child.target}
                                      >
                                        {child.icon && <child.icon />}
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

        <SidebarGroup>
          <SidebarGroupLabel className="capitalize">General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="group/target text-muted-foreground data-active:bg-sidebar-accent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                  isActive={false}
                  onClick={navigate}
                  render={<Link href="/settings" />}
                  size="lg"
                >
                  <IconSettings className="size-5" />
                  <span className="flex items-center gap-0.5 font-semibold text-lg">
                    Settings
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="group/target text-muted-foreground data-active:bg-sidebar-accent data-active:text-foreground data-active:hover:bg-sidebar-accent [&_svg]:size-6"
                    isActive={false}
                    onClick={navigate}
                    render={<Link href="/admin" />}
                    size="lg"
                  >
                    <IconShieldCheck className="size-5" />
                    <span className="flex items-center gap-0.5 font-semibold text-lg">
                      Admin
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserDropdownMenu />
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
