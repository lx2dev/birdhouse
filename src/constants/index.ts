import {
  IconKey,
  IconLayoutDashboard,
  IconLogs,
  IconPlus,
  IconServer2,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react"

export const DEFAULT_FETCH_LIMIT = 10

export const NAV_ITEMS = [
  { href: "/dashboard", icon: IconServer2, label: "Dashboard" },
  { href: "/dashboard/new", icon: IconPlus, label: "Create Instance" },
  { href: "/dashboard/ssh-keys", icon: IconKey, label: "SSH Keys" },
  {
    disabled: true,
    href: "/dashboard/domains",
    icon: IconWorld,
    label: "Domains",
  },
]
export type NavItem = (typeof NAV_ITEMS)[number]

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: IconLayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: IconUsers, label: "Users" },
  { href: "/admin/instances", icon: IconServer2, label: "Instances" },
  { href: "/admin/logs", icon: IconLogs, label: "Logs" },
]
