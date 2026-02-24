import type { Icon } from "@tabler/icons-react"
import {
  IconAdjustmentsFilled,
  IconBellFilled,
  IconDeviceDesktopCog,
  IconKey,
  IconLayoutDashboard,
  IconLogs,
  IconPlus,
  IconServer2,
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

const PLATFORM_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    icon: IconServer2,
    label: "Dashboard",
    title: "Your instances",
  },
  {
    href: "/dashboard/new",
    icon: IconPlus,
    label: "Create Instance",
    title: "New instance",
  },
  {
    href: "/dashboard/ssh-keys",
    icon: IconKey,
    label: "SSH Keys",
    title: "SSH keys",
  },
  {
    href: "/dashboard/domains",
    icon: IconWorld,
    label: "Domains",
    title: "Domains",
  },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    icon: IconLayoutDashboard,
    label: "Overview",
    title: "Overview",
  },
  {
    href: "/admin/users",
    icon: IconUsers,
    label: "Users",
    title: "Manage users",
  },
  {
    href: "/admin/instances",
    icon: IconServer2,
    label: "Instances",
    title: "Manage instances",
  },
  {
    href: "/admin/templates",
    icon: IconTemplate,
    label: "Templates",
    title: "Manage templates",
  },
  {
    href: "/admin/os",
    icon: IconDeviceDesktopCog,
    label: "Operating Systems",
    title: "Manage operating systems",
  },
  {
    href: "/admin/logs",
    icon: IconLogs,
    label: "Logs",
    title: "System logs",
  },
]

const SETTINGS_NAV_ITEMS: NavItem[] = [
  {
    href: "/settings",
    icon: IconAdjustmentsFilled,
    label: "Preferences",
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

export const NAV_ITEMS = {
  admin: {
    items: ADMIN_NAV_ITEMS,
    key: "admin",
  },
  platform: {
    items: PLATFORM_ITEMS,
    key: "platform",
  },
  settings: {
    items: SETTINGS_NAV_ITEMS,
    key: "settings",
  },
} as const
