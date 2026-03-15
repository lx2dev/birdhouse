"use client"

import { DASHBOARD_SIDEBAR_SECTIONS } from "@/constants"

import { SectionSidebar } from "./section-sidebar"

interface AppSidebarProps {
  isAdmin?: boolean
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  return (
    <SectionSidebar
      homeHref="/dashboard"
      isAdmin={isAdmin}
      sectionKey="platform"
      sections={DASHBOARD_SIDEBAR_SECTIONS}
    />
  )
}
