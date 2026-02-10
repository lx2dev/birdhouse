import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoHexagon,
  IconSquareX,
} from "@tabler/icons-react"

import { env } from "@/env"
import { cn } from "@/lib/utils"
import type { VMStatus } from "@/server/db/schema"

function sanitizeHost(host: string) {
  return host.replace(/^https?:\/\//, "").split(":")[0]
}

export function getInstanceSSHUrl(instanceId: string, username: string) {
  const hostname = sanitizeHost(env.NEXT_PUBLIC_URL)
  return `ssh://${username}@${hostname}/connect/${instanceId}`
}

export function getInstanceSSHCommand(instanceId: string, username: string) {
  const hostname = sanitizeHost(env.NEXT_PUBLIC_URL)
  return `ssh -p 22 ${username}@${hostname}/connect/${instanceId}`
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

export function getNotificationStatusIcon(
  status: "success" | "error" | "info" | "alert",
) {
  switch (status) {
    case "success":
      return IconCircleCheck
    case "error":
      return IconSquareX
    case "info":
      return IconInfoHexagon
    case "alert":
      return IconAlertTriangle
    default:
      return IconInfoHexagon
  }
}

export function getNotificationStatusColor(
  status: "success" | "error" | "info" | "alert",
) {
  switch (status) {
    case "success":
      return "bg-green-600/10 text-green-600"
    case "error":
      return "bg-destructive/10 text-destructive"
    case "info":
      return "bg-sky-500/10 text-sky-500"
    case "alert":
      return "bg-yellow-500/10 text-yellow-500"
    default:
      return "bg-muted-foreground/10 text-muted-foreground"
  }
}
