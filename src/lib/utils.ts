import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { env } from "@/env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return env.NEXT_PUBLIC_URL
}

function sanitizeHost(host: string) {
  return host.replace(/^https?:\/\//, "").split(":")[0]
}

export function getInstanceSSHUrl(instanceId: string, username: string) {
  const hostname = sanitizeHost(env.NEXT_PUBLIC_URL)
  return `ssh://${username}@${instanceId}.${hostname}`
}

export function getInstanceSSHCommand(instanceId: string, username: string) {
  const hostname = sanitizeHost(env.NEXT_PUBLIC_URL)
  return `ssh -p 22 ${username}@${instanceId}.${hostname}`
}
