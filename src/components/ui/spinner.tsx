import { IconLoader2 } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

function Spinner({
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "ref">) {
  return (
    <IconLoader2
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      role="status"
      {...props}
    />
  )
}

export { Spinner }
