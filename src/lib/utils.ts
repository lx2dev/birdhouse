import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { env } from "@/env"
import type { VMStatus } from "@/server/db/schema"

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

export function getInstanceStatusColor(status: VMStatus) {
  switch (status) {
    case "running":
      return cn(
        "border-green-600/20 bg-green-600/10 text-green-600",
        "dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400",
      )
    case "stopped":
      return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
    case "provisioning":
      return cn(
        "border-blue-600/20 bg-blue-600/10 text-blue-600",
        "dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400",
      )
    case "error":
      return "bg-destructive/10 text-destructive border-destructive/20"
    default:
      return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
  }
}
