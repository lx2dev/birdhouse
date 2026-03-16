import type { Icon } from "@tabler/icons-react"
import {
  IconAdjustments,
  IconBell,
  IconClipboardList,
  IconCpu,
  IconDeviceDesktopCog,
  IconKey,
  IconLogs,
  IconPlus,
  IconServer2,
  IconTemplate,
  IconUser,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react"
import type { SocialProvider } from "better-auth"

export const APP_NAME = "Birdhouse"

export const DEFAULT_FETCH_LIMIT = 10

export const DEMO_PASSWORD = "Password123!"

export type NavItem = {
  href: string
  linkHref?: string
  icon: Icon
  label: string
  disabled?: boolean
  title?: string
  target?: string
  matchSubpaths?: boolean
  matchPrefixes?: string[]
  children?: NavChildItem[]
}

export type NavChildItem = {
  href: string
  icon?: Icon
  label: string
  disabled?: boolean
  title?: string
  target?: string
  matchSubpaths?: boolean
  matchPrefixes?: string[]
}

const PLATFORM_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    icon: IconServer2,
    label: "Instances",
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
    children: [
      {
        href: "/settings/account/profile",
        icon: IconUser,
        label: "Profile",
        title: "Profile details",
      },
      {
        href: "/settings/account/security",
        icon: IconKey,
        label: "Security",
        title: "Security settings",
      },
    ],
    href: "/settings/account",
    icon: IconUser,
    label: "Account",
    linkHref: "/settings/account/profile",
    matchSubpaths: true,
    title: "Account settings",
  },
  {
    href: "/settings/notifications",
    icon: IconBell,
    label: "Notifications",
    matchSubpaths: true,
    title: "Notification preferences",
  },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    icon: IconClipboardList,
    label: "Overview",
    title: "Overview",
  },
  {
    children: [
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
    ],
    href: "/admin/instances",
    icon: IconCpu,
    label: "Compute",
    matchPrefixes: ["/admin/instances", "/admin/os", "/admin/templates"],
    title: "Compute resources",
  },
  {
    href: "/admin/users",
    icon: IconUsers,
    label: "Users",
    matchSubpaths: true,
    title: "Manage users",
  },
  {
    href: "/admin/logs",
    icon: IconLogs,
    label: "Logs",
    matchSubpaths: true,
    title: "System logs",
  },
]

export type NavSection = {
  key: string
  label?: string
  items: NavItem[]
  order: number
}

export const NAV_SECTIONS = [
  {
    items: PLATFORM_ITEMS,
    key: "platform",
    label: "Platform",
  },
  {
    items: SETTINGS_NAV_ITEMS,
    key: "settings",
    label: "Settings",
  },
  {
    items: ADMIN_NAV_ITEMS,
    key: "admin",
    label: "Admin",
  },
] as const

export const NAV_ITEMS: Record<string, NavSection> = Object.fromEntries(
  NAV_SECTIONS.map((section, index) => [
    section.key,
    { ...section, order: index },
  ]),
)

export const DASHBOARD_SIDEBAR_SECTIONS: NavSection[] = [NAV_ITEMS.platform]
export const SETTINGS_SIDEBAR_SECTIONS: NavSection[] = [NAV_ITEMS.settings]
export const ADMIN_SIDEBAR_SECTIONS: NavSection[] = [NAV_ITEMS.admin]

export function isNavItemActive(
  pathname: string,
  item: NavItem | NavChildItem,
): boolean {
  if (pathname === item.href) return true

  if (item.matchSubpaths && pathname.startsWith(`${item.href}/`)) {
    return true
  }

  const isPrefixMatch =
    item.matchPrefixes?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? false

  if (isPrefixMatch) return true

  if ("children" in item) {
    return (
      item.children?.some((child) => isNavItemActive(pathname, child)) ?? false
    )
  }

  return false
}

export function getNavItemTitle(pathname: string, items: NavItem[]) {
  for (const item of items) {
    if (isNavItemActive(pathname, item)) {
      const childTitle = getChildNavItemTitle(pathname, item.children ?? [])
      return childTitle ?? item.title
    }
  }

  return undefined
}

function getChildNavItemTitle(
  pathname: string,
  items: NavChildItem[],
): string | undefined {
  for (const item of items) {
    if (isNavItemActive(pathname, item)) {
      return item.title
    }
  }

  return undefined
}

export const TRUSTED_SOCIAL_PROVIDERS = [
  "discord",
  "github",
  "google",
] as const satisfies readonly SocialProvider[]
export type TrustedSocialProvider = (typeof TRUSTED_SOCIAL_PROVIDERS)[number]

export const REPO_URL = "https://github.com/lx2dev/birdhouse"
