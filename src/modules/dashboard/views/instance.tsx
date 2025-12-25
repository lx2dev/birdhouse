"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import type { User } from "better-auth"
import { redirect, useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/client"
import { getInstanceStatusColor } from "@/lib/utils"
import { InstanceConsoleSection } from "@/modules/dashboard/sections/instance/console-link"
import { InstanceControlsSection } from "@/modules/dashboard/sections/instance/controls"
import { InstanceDetailsSection } from "@/modules/dashboard/sections/instance/details"

interface InstanceViewProps {
  id: string
  user: User
}

export function InstanceView({ id, user }: InstanceViewProps) {
  const router = useRouter()

  const [instance] = api.compute.getInstance.useSuspenseQuery({
    id,
  })
  const [status] = api.compute.getInstanceStatus.useSuspenseQuery({
    id,
  })

  if (instance.status === "deleting") return redirect("/dashboard")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} size="icon" variant="ghost">
          <IconArrowLeft />
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-3xl tracking-tight">
              {instance.name}
            </h1>
            <Badge className={getInstanceStatusColor(instance.status)}>
              {instance.status}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-muted-foreground text-sm">
            {instance.hostname}
          </p>
        </div>
      </div>

      <InstanceControlsSection instance={instance} />
      <InstanceDetailsSection instance={instance} status={status} />
      <InstanceConsoleSection instance={instance} user={user} />
    </div>
  )
}
