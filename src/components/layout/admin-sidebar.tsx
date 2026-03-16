"use client"

import { ADMIN_SIDEBAR_SECTIONS } from "@/constants"

import { SectionSidebar } from "./section-sidebar"

export function AdminSidebar() {
  return (
    <SectionSidebar
      homeHref="/admin"
      isAdmin
      sections={ADMIN_SIDEBAR_SECTIONS}
    />
  )
}
