"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ReactNode } from "react"
import * as React from "react"

import { DataTableFilterOptions } from "@/components/data-table/filter-options"
import { DataTablePagination } from "@/components/data-table/pagination"
import { DataTableSearchFilter } from "@/components/data-table/search-filter"
import { DataTableViewOptions } from "@/components/data-table/view-options"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface FilterOption {
  label: string
  value: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterOptions?: FilterOption[]
  currentFilter?: string | null
  filterLabel?: string
  bulkActions?: (selectedRows: TData[], clearSelection: () => void) => ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterOptions,
  currentFilter,
  filterLabel,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      sorting,
    },
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const selectedCount = Object.keys(rowSelection).length

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <div className="flex flex-1 items-center gap-x-2">
          <DataTableSearchFilter table={table} />
          {selectedCount > 0 &&
            bulkActions &&
            bulkActions(selectedRows, () => setRowSelection({}))}
        </div>
        <div className="flex items-center gap-x-2">
          <DataTableFilterOptions
            currentFilter={currentFilter}
            filterLabel={filterLabel}
            filterOptions={filterOptions}
          />
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="@container py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
