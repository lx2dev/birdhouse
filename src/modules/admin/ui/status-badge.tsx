import { cn } from "@/lib/utils"

type Status =
  | "running"
  | "stopped"
  | "provisioning"
  | "suspended"
  | "error"
  | "deleting"
  | "rebooting"
  | "available"
  | "unavailable"
  | "testing"
  | "approved"
  | "pending"
  | "banned"

const statusConfig: Record<Status, { label: string; className: string }> = {
  approved: {
    className: cn(
      "border-green-600/30 bg-green-600/15 text-green-600",
      "darkborder-green-400/30 darkbg-green-400/15 darktext-green-400",
    ),
    label: "Approved",
  },
  available: {
    className: cn(
      "border-green-600/30 bg-green-600/15 text-green-600",
      "dark:border-green-400/30 dark:bg-green-400/15 dark:text-green-400",
    ),
    label: "Available",
  },
  banned: {
    className: "bg-destructive/15 text-destructive border-destructive/30",
    label: "Banned",
  },
  deleting: {
    className: "bg-destructive/15 text-destructive border-destructive/30",
    label: "Deleting",
  },
  error: {
    className: "bg-destructive/15 text-destructive border-destructive/30",
    label: "Error",
  },
  pending: {
    className: cn(
      "border-amber-600/30 bg-amber-600/15 text-amber-600",
      "dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-400",
    ),
    label: "Pending",
  },
  provisioning: {
    className: cn(
      "border-blue-600/30 bg-blue-600/15 text-blue-600",
      "dark:border-blue-400/30 dark:bg-blue-400/15 dark:text-blue-400",
    ),
    label: "Provisioning",
  },
  rebooting: {
    className: cn(
      "border-blue-600/30 bg-blue-600/15 text-blue-600",
      "dark:border-blue-400/30 dark:bg-blue-400/15 dark:text-blue-400",
    ),
    label: "Rebooting",
  },
  running: {
    className: cn(
      "border-green-600/30 bg-green-600/15 text-green-600",
      "dark:border-green-400/30 dark:bg-green-400/15 dark:text-green-400",
    ),
    label: "Running",
  },
  stopped: {
    className: "bg-muted text-muted-foreground border-border",
    label: "Stopped",
  },
  suspended: {
    className: cn(
      "border-amber-600/30 bg-amber-600/15 text-amber-600",
      "dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-400",
    ),
    label: "Suspended",
  },
  testing: {
    className: cn(
      "border-amber-600/30 bg-amber-600/15 text-amber-600",
      "dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-400",
    ),
    label: "Testing",
  },
  unavailable: {
    className: "bg-muted text-muted-foreground border-border",
    label: "Unavailable",
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.stopped

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium text-xs",
        config.className,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "running" ||
            status === "available" ||
            status === "approved"
            ? "animate-pulse bg-green-600 dark:bg-green-400"
            : status === "error" || status === "deleting" || status === "banned"
              ? "bg-destructive"
              : status === "provisioning" || status === "rebooting"
                ? "animate-pulse bg-blue-600 dark:bg-blue-400"
                : status === "suspended" ||
                    status === "testing" ||
                    status === "pending"
                  ? "bg-amber-600 dark:bg-amber-400"
                  : "bg-muted-foreground",
        )}
      />
      {config.label}
    </span>
  )
}
