import { cn } from "@/lib/utils"

type Flag = "banned" | "approved"
type Status = "approved" | "pending" | "banned" | "notBanned"

const statusConfig: Record<
  Status,
  { label: string; className: string; dotClassName: string }
> = {
  approved: {
    className: cn(
      "border-green-600/30 bg-green-600/15 text-green-600",
      "dark:border-green-400/30 dark:bg-green-400/15 dark:text-green-400",
    ),
    dotClassName: "bg-green-600 dark:bg-green-400",
    label: "Approved",
  },
  banned: {
    className: "bg-destructive/15 text-destructive border-destructive/30",
    dotClassName: "bg-destructive",
    label: "Banned",
  },
  notBanned: {
    className: "bg-muted text-muted-foreground border-muted/30",
    dotClassName: "bg-muted-foreground/70",
    label: "Not banned",
  },
  pending: {
    className: cn(
      "border-amber-600/30 bg-amber-600/15 text-amber-600",
      "dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-400",
    ),
    dotClassName: "animate-pulse bg-amber-600 dark:bg-amber-400",
    label: "Pending",
  },
}

interface UserStatusBadgeProps {
  flag: Flag
  value: boolean
}

export function UserStatusBadge({ flag, value }: UserStatusBadgeProps) {
  const status: Status =
    flag === "approved"
      ? value
        ? "approved"
        : "pending"
      : value
        ? "banned"
        : "notBanned"

  const config = statusConfig[status] ?? {
    className: "bg-muted text-muted-foreground border-muted/30",
    dotClassName: "bg-muted",
    label: "Unknown",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium text-xs",
        config.className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", config.dotClassName)}
      />
      {config.label}
    </span>
  )
}
