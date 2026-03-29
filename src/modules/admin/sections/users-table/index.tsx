"use client"

import { IconExclamationCircleFilled, IconTrash } from "@tabler/icons-react"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

import { DataTable } from "@/components/data-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
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
  const utils = api.useUtils()
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

  const deleteUsers = api.admin.users.deleteMany.useMutation({
    onError(error) {
      toast.error("Something went wrong!", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Users deleted successfully!")
      utils.admin.users.list.invalidate()
    },
  })

  const usersData = users.pages.flatMap((page) => page.items)
  const columns = getUserColumns(currentUserId)

  return (
    <DataTable<UserWithVMCount, unknown>
      bulkActions={(selectedRows, clearSelection) => {
        const hasCurrentUser = selectedRows.some(
          (row) => row.id === currentUserId,
        )

        if (hasCurrentUser) {
          return (
            <Button disabled variant="destructive">
              You cannot delete your own account
            </Button>
          )
        }

        return (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  disabled={hasCurrentUser || deleteUsers.isPending}
                  variant="destructive"
                >
                  <IconTrash /> Delete {selectedRows.length} items
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  Are you sure you want to{" "}
                  <strong>delete {selectedRows.length}</strong> users?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All selected users will be
                  marked for deletion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={hasCurrentUser || deleteUsers.isPending}
                  onClick={() => {
                    deleteUsers.mutate(
                      { userIds: selectedRows.map((row) => row.id) },
                      {
                        onSuccess() {
                          clearSelection()
                        },
                      },
                    )
                  }}
                  variant="destructive"
                >
                  {deleteUsers.isPending ? <Spinner /> : <IconTrash />}
                  Delete {selectedRows.length} users
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      }}
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
