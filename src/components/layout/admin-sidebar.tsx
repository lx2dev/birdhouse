"use client"

import { ADMIN_SIDEBAR_SECTIONS } from "@/constants"

import { SectionSidebar } from "./section-sidebar"

export function AdminSidebar() {
  return (
    <SectionSidebar
      homeHref="/admin"
      isAdmin
      sectionKey="admin"
      sections={ADMIN_SIDEBAR_SECTIONS}
    />
  )
}
