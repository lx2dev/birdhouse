import type { Icon } from "@tabler/icons-react"
import {
  IconAdjustments,
  IconBell,
  IconDeviceDesktopCog,
  IconKey,
  IconLayoutDashboard,
  IconLogs,
  IconPlus,
  IconServer2,
  IconShieldCheck,
  IconTemplate,
  IconUser,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react"
import type { SocialProvider } from "better-auth"

export const APP_NAME = "Birdhouse"

export const DEFAULT_FETCH_LIMIT = 10

export const DEMO_PASSWORD = "Password123!"

type NavItem = {
  href: string
  icon: Icon
  label: string
  disabled?: boolean
  title?: string
  target?: string
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

const SETTINGS_NAV_ITEMS: NavItem[] = [
  {
    href: "/settings",
    icon: IconAdjustments,
    label: "Preferences",
    title: "User Preferences",
  },
  {
    href: "/settings/account/profile",
    icon: IconUser,
    label: "Profile",
    title: "Profile details",
  },
  {
    href: "/settings/account/security",
    icon: IconShieldCheck,
    label: "Security",
    title: "Security settings",
  },
  {
    href: "/settings/notifications",
    icon: IconBell,
    label: "Notifications",
    title: "Notification preferences",
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

type NavSection = {
  key: string
  items: NavItem[]
  order: number
}

export const NAV_SECTIONS = [
  {
    items: PLATFORM_ITEMS,
    key: "platform",
  },
  {
    items: SETTINGS_NAV_ITEMS,
    key: "settings",
  },
  {
    items: ADMIN_NAV_ITEMS,
    key: "admin",
  },
] as const

export const NAV_ITEMS: Record<string, NavSection> = Object.fromEntries(
  NAV_SECTIONS.map((section, index) => [
    section.key,
    { ...section, order: index },
  ]),
)

export const TRUSTED_SOCIAL_PROVIDERS = [
  "discord",
  "github",
  "google",
] as const satisfies readonly SocialProvider[]
export type TrustedSocialProvider = (typeof TRUSTED_SOCIAL_PROVIDERS)[number]

export const REPO_URL = "https://github.com/lx2dev/birdhouse"
