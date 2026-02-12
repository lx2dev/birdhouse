import {
  IconCheck,
  IconExclamationCircleFilled,
  IconPointFilled,
} from "@tabler/icons-react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import type { StepStatus } from "./types"

interface StepRowProps {
  title: string
  description: string
  status: StepStatus
}

export function StepRow({ title, description, status }: StepRowProps) {
  return (
    <div
      className={cn("flex items-start gap-3", getStepRowStatusClass(status))}
    >
      <div className="mt-0.5 flex size-5 items-center justify-center">
        {status === "done" && <IconCheck className="size-4" />}
        {status === "in-progress" && <Spinner className="size-4" />}
        {status === "error" && (
          <IconExclamationCircleFilled className="size-4 text-destructive" />
        )}
        {status === "pending" && (
          <IconPointFilled className="size-3 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  )
}

function getStepRowStatusClass(status: StepStatus) {
  switch (status) {
    case "done":
      return "opacity-100 text-green-500"
    case "in-progress":
      return "opacity-100 text-primary"
    case "error":
      return "opacity-100 text-destructive"
    case "pending":
      return "opacity-50 text-foreground"
  }
}
