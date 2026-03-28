"use client"

import { IconExclamationCircleFilled } from "@tabler/icons-react"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { DataTable } from "@/components/data-table"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import type { AdminUserFilter } from "@/modules/admin/schemas"
import { AdminUserFilterSchema } from "@/modules/admin/schemas"
import { getUserColumns } from "@/modules/admin/sections/users-table/columns"

import type { UserWithVMCount } from "./columns"

const ADMIN_USER_FILTER_OPTIONS = AdminUserFilterSchema.options.map(
  (value) => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value,
  }),
)

interface UsersTableSectionProps {
  currentUserId: string | undefined
  initialFilter?: AdminUserFilter
}

export function UsersTableSection({
  currentUserId,
  initialFilter,
}: UsersTableSectionProps) {
  return (
    <Suspense fallback={<UsersTableSection.Skeleton />}>
      <ErrorBoundary fallback={<UsersTableSection.Error />}>
        <UsersTableSuspense
          currentUserId={currentUserId}
          initialFilter={initialFilter}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

function UsersTableSuspense({
  currentUserId,
  initialFilter,
}: UsersTableSectionProps) {
  const searchParams = useSearchParams()

  const [filter, setFilter] = React.useState<AdminUserFilter | undefined>(
    initialFilter,
  )

  React.useEffect(() => {
    const parsedFilter = AdminUserFilterSchema.safeParse(
      searchParams.get("filter"),
    )
    setFilter(parsedFilter.success ? parsedFilter.data : undefined)
  }, [searchParams])

  const [users] = api.admin.users.list.useSuspenseInfiniteQuery(
    { filter, limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const usersData = users.pages.flatMap((page) => page.items)
  const columns = getUserColumns(currentUserId)

  return (
    <DataTable<UserWithVMCount, unknown>
      columns={columns}
      currentFilter={filter || null}
      data={usersData}
      filterLabel="User Status"
      filterOptions={ADMIN_USER_FILTER_OPTIONS}
    />
  )
}

UsersTableSection.Skeleton = () => (
  <div className="w-full">
    <div className="mb-4 flex justify-between">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-8 w-24" />
    </div>
    <Skeleton className="h-48" />
  </div>
)

UsersTableSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle className="text-base">Failed to load users.</EmptyTitle>
      <EmptyDescription>
        An error occurred while fetching the users. Please try again later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
