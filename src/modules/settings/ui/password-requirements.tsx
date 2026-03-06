import { IconCheck } from "@tabler/icons-react"
import type { ControllerRenderProps } from "react-hook-form"
import type z from "zod"

import { cn } from "@/lib/utils"
import { passwordFormSchema } from "@/modules/settings/schemas/account"

const formSchema = passwordFormSchema.pick({
  newPassword: true,
})

interface PasswordRequirementsProps {
  field: ControllerRenderProps<z.infer<typeof formSchema>, "newPassword">
}

export function PasswordRequirements({ field }: PasswordRequirementsProps) {
  const { value } = field

  const requirements = [
    {
      isValid: value.length >= 12,
      label: "At least 12 characters",
    },
    {
      isValid: /[A-Z]/.test(value),
      label: "At least one uppercase letter",
    },
    {
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      label: "At least one special character",
    },
  ]

  return (
    <span className="space-y-1">
      {requirements.map((requirement, index) => (
        <span
          className={cn(
            "flex items-center gap-2 text-sm",
            requirement.isValid ? "text-green-500" : "text-muted-foreground",
          )}
          key={index}
        >
          <IconCheck className="inline-block size-4 shrink-0" />
          {requirement.label}
        </span>
      ))}
    </span>
  )
}
