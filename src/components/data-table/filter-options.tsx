"use client"

import { IconFilter } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FilterOption {
  label: string
  value: string
}

interface DataTableFilterOptionsProps {
  filterOptions?: FilterOption[]
  currentFilter?: string | null
  filterLabel?: string
}

export function DataTableFilterOptions({
  filterOptions,
  currentFilter,
  filterLabel = "Filter",
}: DataTableFilterOptionsProps) {
  const router = useRouter()

  if (!filterOptions) return null

  function handleFilterChange(value: string | null) {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set("filter", value)
    } else {
      params.delete("filter")
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="ml-auto hidden h-8 lg:flex"
            size="sm"
            variant="outline"
          />
        }
      >
        <IconFilter />
        {filterLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{filterLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            onValueChange={(value) =>
              handleFilterChange(value === "" ? null : value)
            }
            value={currentFilter || ""}
          >
            <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
            {filterOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
