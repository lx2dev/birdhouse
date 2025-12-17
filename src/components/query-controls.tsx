"use client"

import {
  IconCheck,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type SortOrder = "asc" | "desc"

export type QueryControlsValue = {
  status?: string
  sortBy?: string
  sortOrder?: SortOrder
}

type Option = { label: string; value: string }

type Props = {
  statusOptions?: Option[]
  sortOptions?: Option[]
  value: QueryControlsValue
  onChange: (v: QueryControlsValue) => void
  onApply?: () => void
  onReset?: () => void
  className?: string
}

export function QueryControls({
  statusOptions = [],
  sortOptions = [],
  value,
  onChange,
  onApply,
  onReset,
  className,
}: Props) {
  function handleStatus(val: string | null) {
    if (val !== null) onChange({ ...value, status: val })
  }
  function handleSortBy(val: string | null) {
    if (val !== null) onChange({ ...value, sortBy: val })
  }
  function toggleOrder() {
    const newOrder = value.sortOrder === "asc" ? "desc" : "asc"
    const defaultSort = sortOptions.length
      ? sortOptions[0].value
      : "displayName"
    const newSortBy = value.sortBy ?? defaultSort
    onChange({
      ...value,
      sortBy: newSortBy,
      sortOrder: newOrder,
    })
  }

  const hasControls =
    (value.status && value.status !== "any") ||
    (value.sortBy && value.sortBy !== "")

  return (
    <div className={cn(className)}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {statusOptions.length > 0 && (
            <Select onValueChange={handleStatus} value={value.status ?? "any"}>
              <SelectTrigger className="h-8 min-w-30 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem
                    className="capitalize"
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {sortOptions.length > 0 && (
            <Select onValueChange={handleSortBy} value={value.sortBy ?? ""}>
              <SelectTrigger className="h-8 min-w-35">
                <SelectValue aria-placeholder="Sort by">
                  {value.sortBy
                    ? sortOptions.find((opt) => opt.value === value.sortBy)
                        ?.label
                    : "Sort by"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button onClick={toggleOrder} size="sm" variant="outline">
            {value.sortOrder === "asc" ? (
              <div className="flex items-center gap-1">
                <IconSortAscending className="size-4" />
                <span className="text-xs">Asc</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <IconSortDescending className="size-4" />
                <span className="text-xs">Desc</span>
              </div>
            )}
          </Button>
        </div>

        <Separator className="h-8" orientation="vertical" />

        <div className="flex items-center gap-2">
          {onReset && (
            <Button
              onClick={onReset}
              size="sm"
              variant={hasControls ? "destructive" : "ghost"}
            >
              <IconX /> Reset
            </Button>
          )}
          {onApply && (
            <Button
              onClick={onApply}
              size="sm"
              variant={hasControls ? "default" : "outline"}
            >
              <IconCheck /> Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QueryControls
