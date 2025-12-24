import { IconKey, IconPlus, IconServer2 } from "@tabler/icons-react"

export const DEFAULT_FETCH_LIMIT = 10

export const PM_DEFAULT_NODE = "pve01"
export const PM_DEFAULT_POOL = "UserPool"

export const NAV_ITEMS = [
  { href: "/dashboard", icon: IconServer2, label: "Dashboard" },
  { href: "/dashboard/new", icon: IconPlus, label: "Create Instance" },
  { href: "/dashboard/ssh-keys", icon: IconKey, label: "SSH Keys" },
]
export type NavItem = (typeof NAV_ITEMS)[number]
