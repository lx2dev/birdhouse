"use client"

import { IconExclamationCircleFilled } from "@tabler/icons-react"
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
