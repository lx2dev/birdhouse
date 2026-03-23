"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { DataTable } from "@/components/data-table"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { getUserColumns } from "@/modules/admin/sections/users-table/columns"

import type { UserWithVMCount } from "./columns"

interface UsersTableSectionProps {
  currentUserId: string | undefined
}

export function UsersTableSection({ currentUserId }: UsersTableSectionProps) {
  return (
    <Suspense fallback={<UsersTableSection.Skeleton />}>
      <ErrorBoundary fallback={<UsersTableSection.Error />}>
        <UsersTableSuspense currentUserId={currentUserId} />
      </ErrorBoundary>
    </Suspense>
  )
}

function UsersTableSuspense({ currentUserId }: UsersTableSectionProps) {
  const [users] = api.admin.users.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const usersData = users.pages.flatMap((page) => page.items)
  const columns = getUserColumns(currentUserId)

  return (
    <div>
      <DataTable<UserWithVMCount, unknown> columns={columns} data={usersData} />
    </div>
  )
}

UsersTableSection.Skeleton = () => (
  <div className="w-full animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  </div>
)

UsersTableSection.Error = () => (
  <div className="w-full">
    <p className="text-center text-destructive">Failed to load users.</p>
  </div>
)
