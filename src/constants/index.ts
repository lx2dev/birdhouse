import type { Icon } from "@tabler/icons-react"
import {
  IconBellFilled,
  IconDeviceDesktopCog,
  IconKey,
  IconLayoutDashboard,
  IconLogs,
  IconPlus,
  IconServer2,
  IconSettingsFilled,
  IconShieldCheckFilled,
  IconTemplate,
  IconUserFilled,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react"

export const DEFAULT_FETCH_LIMIT = 10

type NavItem = {
  href: string
  icon: Icon
  label: string
  disabled?: boolean
  title?: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: IconServer2, label: "Dashboard" },
  { href: "/dashboard/new", icon: IconPlus, label: "Create Instance" },
  { href: "/dashboard/ssh-keys", icon: IconKey, label: "SSH Keys" },
  { href: "/dashboard/domains", icon: IconWorld, label: "Domains" },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", icon: IconLayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: IconUsers, label: "Users" },
  { href: "/admin/instances", icon: IconServer2, label: "Instances" },
  { href: "/admin/templates", icon: IconTemplate, label: "Templates" },
  { href: "/admin/os", icon: IconDeviceDesktopCog, label: "Operating Systems" },
  { href: "/admin/logs", icon: IconLogs, label: "Logs" },
]

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  {
    href: "/settings",
    icon: IconSettingsFilled,
    label: "Settings",
    title: "User Preferences",
  },
  {
    href: "/settings/account/profile",
    icon: IconUserFilled,
    label: "Profile",
    title: "Profile details",
  },
  {
    href: "/settings/account/security",
    icon: IconShieldCheckFilled,
    label: "Security",
    title: "Security settings",
  },
  {
    href: "/settings/notifications",
    icon: IconBellFilled,
    label: "Notifications",
    title: "Notification preferences",
  },
]
