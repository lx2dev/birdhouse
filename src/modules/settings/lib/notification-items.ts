import { IconAlertTriangle, IconCpu } from "@tabler/icons-react"
import type { z } from "zod"

import type { userPreferencesSchema } from "@/schemas/user-preferences"

export type NotificationItem = {
  id: keyof z.infer<typeof userPreferencesSchema>["notifications"]
  label: string
  description: string
  detail: string
  icon: React.ElementType
  badge?: string
}

export const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    description: "Receive email notifications for compute lifecycle events.",
    detail:
      "You'll get notified when compute jobs start, complete, fail, or are cancelled. This includes timeouts and resource limits.",
    icon: IconCpu,
    id: "emailOnComputeEvents",
    label: "Compute Events",
  },
  {
    badge: "Recommended",
    description: "Receive email notifications for critical system alerts.",
    detail:
      "Includes security incidents, service degradations, maintenance windows, and other important system-level notices.",
    icon: IconAlertTriangle,
    id: "emailOnSystemAlerts",
    label: "System Alerts",
  },
]
