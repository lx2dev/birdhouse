"use client"

import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { DashboardSection } from "@/modules/dashboard/sections/dashboard"

export function DashboardView() {
  const [sshKeys] = api.sshKey.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const keys = sshKeys.pages.flatMap((page) => page.items)

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
        {keys.length === 0 ? null : (
          <Link href="/dashboard/new">
            <Button>
              <IconPlus />
              Create Instance
            </Button>
          </Link>
        )}
      </div>

      <DashboardSection />
    </div>
  )
}
