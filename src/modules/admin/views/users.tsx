import { getSession } from "@/lib/auth/utils"
import type { AdminUserFilter } from "@/modules/admin/schemas"
import { UsersTableSection } from "@/modules/admin/sections/users-table"
import { CreateUserModal } from "@/modules/admin/ui/create-user-modal"

interface UsersViewProps {
  filter?: AdminUserFilter
}

export async function UsersView({ filter }: UsersViewProps) {
  const session = await getSession()

  return (
    <div className="@container space-y-6">
      <div className="flex @md:flex-row flex-col items-start @md:items-center @md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage user accounts and permissions
          </p>
        </div>

        <CreateUserModal />
      </div>

      <UsersTableSection
        currentUserId={session?.user.id}
        initialFilter={filter}
      />
    </div>
  )
}
