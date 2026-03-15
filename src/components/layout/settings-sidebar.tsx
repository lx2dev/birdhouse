"use client"

import { SETTINGS_SIDEBAR_SECTIONS } from "@/constants"

import { SectionSidebar } from "./section-sidebar"

export function SettingsSidebar() {
  return (
    <SectionSidebar homeHref="/settings" sections={SETTINGS_SIDEBAR_SECTIONS} />
  )
}
