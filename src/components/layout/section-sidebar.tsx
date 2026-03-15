"use client"

import { IconArrowUpRight } from "@tabler/icons-react"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import type { NavSection } from "@/constants"
import { APP_NAME, isNavItemActive } from "@/constants"

interface SectionSidebarProps {
  sections: NavSection[]
  homeHref: string
}

export function SectionSidebar({ homeHref, sections }: SectionSidebarProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  function navigate() {
    setOpenMobile(false)
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="mx-4 px-0 py-0">
        <Link className="flex items-center gap-2" href={homeHref}>
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="inline font-semibold text-lg md:text-2xl">
            {APP_NAME}
          </span>
        </Link>
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
