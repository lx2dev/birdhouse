"use client"

import { SETTINGS_SIDEBAR_SECTIONS } from "@/constants"

import { SectionSidebar } from "./section-sidebar"

interface SettingsSidebarProps {
  isAdmin?: boolean
}

export function SettingsSidebar({ isAdmin = false }: SettingsSidebarProps) {
  return (
    <SectionSidebar
      homeHref="/settings"
      isAdmin={isAdmin}
      sections={SETTINGS_SIDEBAR_SECTIONS}
    />
  )
}
