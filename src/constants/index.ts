import {
  IconKey,
  IconLayoutDashboard,
  IconPlus,
  IconServer2,
  IconUsers,
} from "@tabler/icons-react"

export const DEFAULT_FETCH_LIMIT = 10

export const NAV_ITEMS = [
  { href: "/dashboard", icon: IconServer2, label: "Dashboard" },
  { href: "/dashboard/new", icon: IconPlus, label: "Create Instance" },
  { href: "/dashboard/ssh-keys", icon: IconKey, label: "SSH Keys" },
]
export type NavItem = (typeof NAV_ITEMS)[number]

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: IconLayoutDashboard, label: "Admin Dashboard" },
  { href: "/admin/users", icon: IconUsers, label: "Manage Users" },
  { href: "/admin/instances", icon: IconServer2, label: "Manage Instances" },
]
