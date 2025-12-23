"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/client"
import { InstanceConsoleSection } from "@/modules/dashboard/sections/instance/console-link"
import { InstanceControlsSection } from "@/modules/dashboard/sections/instance/controls"
import { InstanceDetailsSection } from "@/modules/dashboard/sections/instance/details"
import type { VMStatus } from "@/server/db/schema"

export function InstanceView({ id }: { id: string }) {
  const [instance, instanceQuery] = api.compute.getInstance.useSuspenseQuery({
    id,
  })
  const [status, statusQuery] = api.compute.getInstanceStatus.useSuspenseQuery({
    id,
  })

  if (instance.status === "deleting") return redirect("/dashboard")

  function getStatusColor(status: VMStatus) {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "stopped":
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
      case "provisioning":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          nativeButton={false}
          render={
            <Link href="/dashboard">
              <IconArrowLeft />
            </Link>
          }
          size="icon"
          variant="ghost"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-3xl tracking-tight">
              {instance.name}
            </h1>
            <Badge className={getStatusColor(instance.status)}>
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
      <InstanceConsoleSection instance={instance} />
    </div>
  )
}
