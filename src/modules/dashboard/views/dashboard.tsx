import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DashboardSection } from "@/modules/dashboard/sections/dashboard"

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Virtual Machines
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your cloud instances
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <IconPlus />
            Create Instance
          </Button>
        </Link>
      </div>

      <DashboardSection />
    </div>
  )
}
