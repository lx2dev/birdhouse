"use client"

import {
  IconBan,
  IconCheck,
  IconDots,
  IconHandStop,
  IconMail,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { adminCanPerformRowAction } from "@/helpers/admin-can-perform-row-action"
import { api } from "@/lib/api/client"
import type { UserWithVMCount } from "@/modules/admin/sections/users-table/columns"

interface RowActionsProps {
  user: UserWithVMCount
  currentUserId: string | undefined
}

export function RowActions({ user, currentUserId }: RowActionsProps) {
  const canManageUser = adminCanPerformRowAction({
    currentUserId,
    targetUserEmail: user.email,
    targetUserId: user.id,
    targetUserRole: user.role,
  })

  const utils = api.useUtils()

  const approveUser = api.admin.users.approve.useMutation({
    onError(error) {
      console.error("Failed to approve user:", error)
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("User approved successfully")
      utils.admin.users.list.invalidate()
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={!canManageUser ? "pointer-events-none hidden" : ""}
        render={
          <Button
            aria-label="Open actions menu"
            className="size-8"
            disabled={!canManageUser}
            variant="ghost"
          />
        }
      >
        <IconDots />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {!user.approved && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  approveUser.mutate({
                    userId: user.id,
                  })
                }}
              >
                <IconCheck className="text-primary" />
                Approve user
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // rejectUser.mutate({
                  //   userId: user.id,
                  // })
                }}
              >
                <IconX className="text-destructive" />
                Reject user
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem>
            <IconMail />
            Send email
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {!user.banned && (
            <DropdownMenuItem variant="destructive">
              <IconBan />
              Ban user
            </DropdownMenuItem>
          )}
          {user.banned && (
            <DropdownMenuItem className="text-green-500 focus:text-green-500">
              <IconHandStop />
              Unban user
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
