"use client"

import { IconShield, IconUser } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import type { RouterOutputs } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { RowActions } from "@/modules/admin/sections/users-table/row-actions"
import { UserStatusBadge } from "@/modules/admin/ui/user-status-badge"

export type UserWithVMCount =
  RouterOutputs["admin"]["users"]["list"]["items"][number]

export function getUserColumns(
  currentUserId: string | undefined,
): ColumnDef<UserWithVMCount>[] {
  return [
    {
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected() === true}
          indeterminate={
            table.getIsAllPageRowsSelected() !== true &&
            table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      id: "select",
    },
    {
      accessorKey: "email",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                alt={user.name}
                src={user.image ?? "https://gravatar.com/avatar/HASH"}
              />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )
      },
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "approved",
      cell: ({ row }) => (
        <UserStatusBadge flag="approved" value={row.getValue("approved")} />
      ),
      header: "Approved",
    },
    {
      accessorKey: "banned",
      cell: ({ row }) => (
        <UserStatusBadge flag="banned" value={row.getValue("banned")} />
      ),
      header: "Banned",
    },
    {
      accessorKey: "role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string

        function getRoleIcon(role: string) {
          switch (role) {
            case "user":
              return <IconUser className="size-4" />
            case "admin":
              return <IconShield className="size-4" />
          }
        }

        return (
          <span
            className={cn(
              "flex items-center gap-1 text-muted-foreground capitalize",
              role === "admin" ? "text-primary" : "text-chart-2",
            )}
          >
            {getRoleIcon(role)} {role}
          </span>
        )
      },
      header: "Role",
    },
    {
      accessorFn: (row) => row.vmCount,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("vmCount")} VMs
        </span>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="VMs" />
      ),
      id: "vmCount",
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <span className="text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" />
      ),
    },
    {
      cell: ({ row }) => {
        const user = row.original
        return <RowActions currentUserId={currentUserId} user={user} />
      },
      enableHiding: false,
      id: "actions",
    },
  ]
}
