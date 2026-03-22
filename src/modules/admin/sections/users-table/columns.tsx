"use client"

import {
  IconArrowsUpDown,
  IconBan,
  IconDots,
  IconHandStop,
  IconMail,
  IconUserCheck,
} from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/auth/utils"
import { StatusBadge } from "@/modules/admin/ui/status-badge"
import { DataTableColumnHeader } from "@/components/data-table/column-header"

export type UserWithVMCount = User & {
  vmCount: number
}

export const UserColumns: ColumnDef<UserWithVMCount>[] = [
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
    cell: ({ row }) => <StatusBadge status={row.getValue("approved")} />,
    header: "Approved",
  },
  {
    accessorKey: "banned",
    cell: ({ row }) => <StatusBadge status={row.getValue("banned")} />,
    header: "Banned",
  },
  {
    accessorKey: "role",
    cell: ({ row }) => (
      <span className="text-muted-foreground capitalize">
        {row.getValue("role")}
      </span>
    ),
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
      <Button
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        VMs
        <IconArrowsUpDown />
      </Button>
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
      <Button
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Joined
        <IconArrowsUpDown />
      </Button>
    ),
  },
  {
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label="Open actions menu"
                className="size-8 p-0"
                variant="ghost"
              />
            }
          >
            <IconDots />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <IconMail />
                Send email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.approved && (
                <DropdownMenuItem className="text-success focus:text-success">
                  <IconUserCheck />
                  Approve user
                </DropdownMenuItem>
              )}
              {!user.banned && (
                <DropdownMenuItem className="text-destructive focus:text-destructive">
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
    },
    enableHiding: false,
    id: "actions",
  },
]
