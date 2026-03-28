"use client"

import { IconSearch } from "@tabler/icons-react"
import type { Table } from "@tanstack/react-table"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function DataTableSearchFilter<TData>({
  table,
}: {
  table: Table<TData>
}) {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput
        onChange={(event) =>
          table.getColumn("email")?.setFilterValue(event.target.value)
        }
        placeholder="Search..."
        value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
      />
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      {(table.getColumn("email")?.getFilterValue() as string) && (
        <InputGroupAddon align="inline-end">
          {table.getFilteredRowModel().rows.length} results
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
