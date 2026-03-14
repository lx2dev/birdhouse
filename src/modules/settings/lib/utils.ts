import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
} from "@tabler/icons-react"

import type { TrustedSocialProvider } from "@/constants"

export function formatProviderName(provider: TrustedSocialProvider) {
  switch (provider) {
    case "github":
      return "GitHub"
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1)
  }
}

export function parseUserAgent(ua: string): {
  browser: string
  browserVersion: string
  device: "mobile" | "tablet" | "desktop"
  os: string
} {
  let browser = "Unknown Browser"
  let browserVersion = ""
  let os = "Unknown OS"
  let device: "mobile" | "tablet" | "desktop" = "desktop"

  if (/Windows NT 10/.test(ua)) os = "Windows 10/11"
  else if (/Windows NT 6.3/.test(ua)) os = "Windows 8.1"
  else if (/Windows NT 6.1/.test(ua)) os = "Windows 7"
  else if (/Macintosh/.test(ua)) os = "macOS"
  else if (/iPhone/.test(ua)) os = "iOS"
  else if (/iPad/.test(ua)) os = "iPadOS"
  else if (/Android/.test(ua)) os = "Android"
  else if (/Linux/.test(ua)) os = "Linux"

  if (/iPhone|iPad/.test(ua)) device = /iPad/.test(ua) ? "tablet" : "mobile"
  else if (/Android/.test(ua) && /Mobile/.test(ua)) device = "mobile"
  else if (/Android/.test(ua)) device = "tablet"

  if (/Firefox\/(\d+)/.test(ua)) {
    browser = "Firefox"
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] ?? ""
  } else if (/Edg\/(\d+)/.test(ua)) {
    browser = "Edge"
    browserVersion = ua.match(/Edg\/(\d+)/)?.[1] ?? ""
  } else if (/OPR\/(\d+)/.test(ua)) {
    browser = "Opera"
    browserVersion = ua.match(/OPR\/(\d+)/)?.[1] ?? ""
  } else if (/Chrome\/(\d+)/.test(ua) && !/Chromium/.test(ua)) {
    browser = "Chrome"
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] ?? ""
  } else if (/Safari\/(\d+)/.test(ua) && /Version\/(\d+)/.test(ua)) {
    browser = "Safari"
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] ?? ""
  }

  return {
    browser,
    browserVersion,
    device,
    os,
  }
}

export function getDeviceIcon(ua: string) {
  switch (ua) {
    case "mobile":
      return IconDeviceMobile
    case "tablet":
      return IconDeviceTablet
    default:
      return IconDeviceDesktop
  }
}

export function isExpiringSoon(expiresAt: string | Date): boolean {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 2
}
