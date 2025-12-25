import { IconKey, IconPlus, IconServer2 } from "@tabler/icons-react"

import { env } from "@/env"

export const DEFAULT_FETCH_LIMIT = 10

export const PM_DEFAULT_NODE = env.PM_DEFAULT_NODE
export const PM_DEFAULT_POOL = env.PM_DEFAULT_POOL

export const NAV_ITEMS = [
  { href: "/dashboard", icon: IconServer2, label: "Dashboard" },
  { href: "/dashboard/new", icon: IconPlus, label: "Create Instance" },
  { href: "/dashboard/ssh-keys", icon: IconKey, label: "SSH Keys" },
]
export type NavItem = (typeof NAV_ITEMS)[number]
