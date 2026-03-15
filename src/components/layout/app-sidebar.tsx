"use client"

import { DASHBOARD_SIDEBAR_SECTIONS } from "@/constants"

import { SectionSidebar } from "./section-sidebar"

export function AppSidebar() {
  return (
    <SectionSidebar
      homeHref="/dashboard"
      sections={DASHBOARD_SIDEBAR_SECTIONS}
    />
  )
}
