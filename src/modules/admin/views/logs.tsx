"use client"

import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconDownload,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { format, formatDistanceToNow } from "date-fns"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api/client"
import type {
  AdminLogDateRange,
  AdminLogOutcome,
  AdminLogResourceType,
} from "@/modules/admin/schemas"

interface LogsViewProps {
  initialOutcome?: AdminLogOutcome
  initialQuery?: string
  initialRange?: AdminLogDateRange
  initialResourceType?: AdminLogResourceType
}

interface ExportLogItem {
  action: string
  details: unknown
  id: string
  ipAddress: string | null
  resourceId: string | null
  resourceType: string
  timestamp: string
  userEmail: string
  userId: string
  userImage: string | null
  userName: string
}

function escapeCsvValue(value: unknown) {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replaceAll('"', '""')}"`
  }
  return str
}

function toCsv(logs: ExportLogItem[]) {
  const headers = [
    "timestamp",
    "action",
    "resourceType",
    "resourceId",
    "userName",
    "userEmail",
    "ipAddress",
    "details",
  ]

  const lines = logs.map((log) =>
    [
      log.timestamp,
      log.action,
      log.resourceType,
      log.resourceId ?? "",
      log.userName,
      log.userEmail,
      log.ipAddress ?? "",
      JSON.stringify(log.details),
    ]
      .map(escapeCsvValue)
      .join(","),
  )

  return [headers.join(","), ...lines].join("\n")
}

function toVisibleLogsText(logs: ExportLogItem[]) {
  const headers = ["time", "status", "user", "resource", "action", "summary"]

  const lines = logs.map((log) => {
    const status = getLogOutcome(log.action)
    const resource = `${log.resourceType}${log.resourceId ? `:${log.resourceId.slice(0, 8)}` : ""}`
    const summary = getDetailsSummary(log.details)

    return [
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      status,
      log.userName,
      resource,
      formatAction(log.action),
      summary,
    ].join("\t")
  })

  return [headers.join("\t"), ...lines].join("\n")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = href
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(href)
}

function getLogOutcome(action: string): Exclude<AdminLogOutcome, "all"> {
  if (action.includes("failed") || action === "error") return "failed"
  if (action.includes("requested") || action.includes("initiated")) {
    return "in_progress"
  }
  return "success"
}

function getOutcomeBadgeProps(action: string): {
  label: string
  variant: "default" | "destructive" | "outline" | "secondary"
} {
  const outcome = getLogOutcome(action)

  switch (outcome) {
    case "failed":
      return { label: "Failed", variant: "destructive" }
    case "in_progress":
      return { label: "In progress", variant: "outline" }
    default:
      return { label: "Success", variant: "secondary" }
  }
}

function formatAction(action: string) {
  return action
    .replace(/[:_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getDetailsSummary(details: unknown) {
  if (!details || typeof details !== "object") return "No details"

  const detailEntries = Object.entries(details as Record<string, unknown>)
  if (detailEntries.length === 0) return "No details"

  return detailEntries
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" • ")
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const RESOURCE_TYPE_OPTIONS: { label: string; value: AdminLogResourceType }[] =
  [
    { label: "All resources", value: "all" },
    { label: "Users", value: "user" },
    { label: "Virtual machines", value: "virtual_machine" },
    { label: "Templates", value: "vm_template" },
    { label: "Operating systems", value: "operating_system" },
    { label: "SSH keys", value: "ssh_key" },
    { label: "Notifications", value: "notification" },
  ]

const OUTCOME_OPTIONS: { label: string; value: AdminLogOutcome }[] = [
  { label: "All outcomes", value: "all" },
  { label: "Success", value: "success" },
  { label: "In progress", value: "in_progress" },
  { label: "Failed", value: "failed" },
]

const DATE_RANGE_OPTIONS: { label: string; value: AdminLogDateRange }[] = [
  { label: "Last 30 minutes", value: "30m" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "All time", value: "all" },
]

export function LogsView({
  initialOutcome = "all",
  initialQuery = "",
  initialRange = "24h",
  initialResourceType = "all",
}: LogsViewProps) {
  const router = useRouter()
  const utils = api.useUtils()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()

  const [query, setQuery] = React.useState(initialQuery)
  const [outcome, setOutcome] = React.useState<AdminLogOutcome>(initialOutcome)
  const [range, setRange] = React.useState<AdminLogDateRange>(initialRange)
  const [resourceType, setResourceType] =
    React.useState<AdminLogResourceType>(initialResourceType)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null)
  const [isExporting, setIsExporting] = React.useState<"json" | "csv" | null>(
    null,
  )

  const deferredQuery = React.useDeferredValue(query)

  const input = React.useMemo(
    () => ({
      limit: DEFAULT_FETCH_LIMIT * 3,
      outcome,
      query: deferredQuery.trim() ? deferredQuery.trim() : null,
      resourceType,
      timeRange: range,
    }),
    [deferredQuery, outcome, range, resourceType],
  )

  const logsQuery = api.admin.logs.list.useInfiniteQuery(input, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const rows = React.useMemo(
    () => logsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [logsQuery.data],
  )

  React.useEffect(() => {
    if (rows.length === 0) {
      setSelectedLogId(null)
      return
    }

    const selectedExists = rows.some((row) => row.id === selectedLogId)
    if (!selectedExists) {
      setSelectedLogId(rows[0]?.id ?? null)
    }
  }, [rows, selectedLogId])

  const selectedLog = rows.find((log) => log.id === selectedLogId)

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (deferredQuery.trim()) params.set("q", deferredQuery.trim())
    else params.delete("q")

    if (outcome !== "all") params.set("outcome", outcome)
    else params.delete("outcome")

    if (resourceType !== "all") params.set("resourceType", resourceType)
    else params.delete("resourceType")

    if (range !== "24h") params.set("range", range)
    else params.delete("range")

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      })
    }
  }, [
    deferredQuery,
    outcome,
    pathname,
    range,
    resourceType,
    router,
    searchParams,
  ])

  const handleExport = React.useCallback(
    async (fileType: "json" | "csv") => {
      setIsExporting(fileType)

      try {
        const items = await utils.admin.logs.export.fetch({
          limit: 5000,
          outcome,
          query: deferredQuery.trim() ? deferredQuery.trim() : null,
          resourceType,
          timeRange: range,
        })

        const stamp = format(new Date(), "yyyyMMdd-HHmmss")
        if (fileType === "json") {
          downloadFile(
            JSON.stringify(items, null, 2),
            `admin-logs-${stamp}.json`,
            "application/json;charset=utf-8",
          )
        } else {
          downloadFile(
            toCsv(items),
            `admin-logs-${stamp}.csv`,
            "text/csv;charset=utf-8",
          )
        }
      } catch {
        toast.error("Failed to export logs")
      } finally {
        setIsExporting(null)
      }
    },
    [utils.admin.logs.export, deferredQuery, outcome, range, resourceType],
  )

  const handleCopyVisibleLogs = React.useCallback(async () => {
    if (rows.length === 0) {
      toast.error("No visible logs to copy")
      return
    }

    try {
      await navigator.clipboard.writeText(toVisibleLogsText(rows))
      toast.success(`Copied ${rows.length} visible logs`)
    } catch {
      toast.error("Failed to copy visible logs")
    }
  }, [rows])

  const activeFilterCount =
    Number(outcome !== "all") +
    Number(range !== "24h") +
    Number(resourceType !== "all") +
    Number(query.trim().length > 0)

  return (
    <div className="@container space-y-6">
      <header className="space-y-2">
        <div className="flex @md:flex-row flex-col @md:items-center @md:justify-between gap-3">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Logs</h1>
            <p className="text-muted-foreground text-sm">
              Track audit activity, system events, and operational failures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <IconClock />
              Live
            </Badge>
            <Button
              aria-label="Refresh logs"
              disabled={logsQuery.isRefetching}
              onClick={() => logsQuery.refetch()}
              size="lg"
              variant="outline"
            >
              <IconRefresh
                className={logsQuery.isRefetching ? "animate-spin" : ""}
              />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Open logs export actions"
                render={
                  <Button
                    disabled={isExporting !== null}
                    size="lg"
                    variant="outline"
                  />
                }
              >
                {isExporting ? <Spinner /> : <IconDownload />}
                Export
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  disabled={rows.length === 0}
                  onClick={() => void handleCopyVisibleLogs()}
                >
                  <IconCopy />
                  Copy visible logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isExporting !== null}
                  onClick={() => void handleExport("csv")}
                >
                  <IconDownload />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isExporting !== null}
                  onClick={() => void handleExport("json")}
                >
                  <IconDownload />
                  Export to JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Card className="gap-0 overflow-hidden pt-0">
        <CardHeader className="border-b bg-muted/20 py-4">
          <div className="flex @lg:flex-row flex-col @lg:items-center gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search logs"
                className="pl-8"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search action, user, resource, or details"
                value={query}
              />
            </div>

            <Select
              onValueChange={(value) => setOutcome(value as AdminLogOutcome)}
              value={outcome}
            >
              <SelectTrigger className="@lg:w-44 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTCOME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => setRange(value as AdminLogDateRange)}
              value={range}
            >
              <SelectTrigger className="@lg:w-44 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                setResourceType(value as AdminLogResourceType)
              }
              value={resourceType}
            >
              <SelectTrigger className="@lg:w-52 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              disabled={activeFilterCount === 0}
              onClick={() => {
                setOutcome("all")
                setQuery("")
                setRange("24h")
                setResourceType("all")
              }}
              size="sm"
              variant="ghost"
            >
              <IconX />
              Clear
            </Button>
          </div>

          <CardDescription>
            Showing {rows.length} log entries
            {activeFilterCount > 0
              ? ` with ${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`
              : ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[calc(100dvh-20.5rem)] p-0">
          <ResizablePanelGroup
            className="max-h-[calc(100dvh-19.5rem)]"
            orientation="horizontal"
          >
            <ResizablePanel
              defaultSize="100%"
              minSize={isMobile ? "0%" : "66%"}
            >
              <div className="border-r">
                {logsQuery.isLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 14 }).map((_, index) => (
                      <Skeleton className="h-10 w-full" key={index} />
                    ))}
                  </div>
                ) : rows.length === 0 ? (
                  <div className="p-6">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia>
                          <IconSearch />
                        </EmptyMedia>
                        <EmptyTitle>No logs found</EmptyTitle>
                        <EmptyDescription>
                          Try broadening your search or clearing filters.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ) : (
                  <>
                    <Table className="min-w-190">
                      <TableHeader className="z-10 bg-card">
                        <TableRow>
                          <TableHead className="w-32">Time</TableHead>
                          <TableHead className="w-28">Status</TableHead>
                          <TableHead className="w-44">User</TableHead>
                          <TableHead className="w-40">Resource</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((log) => {
                          const badge = getOutcomeBadgeProps(log.action)
                          const isSelected = selectedLogId === log.id

                          return (
                            <TableRow
                              aria-selected={isSelected}
                              className={
                                isSelected ? "bg-muted/40" : "cursor-pointer"
                              }
                              key={log.id}
                              onClick={() => {
                                setSelectedLogId(log.id)
                                setIsDetailsOpen(true)
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault()
                                  setSelectedLogId(log.id)
                                  setIsDetailsOpen(true)
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              <TableCell className="font-mono text-muted-foreground text-xs">
                                {format(
                                  new Date(log.timestamp),
                                  "MMM dd HH:mm:ss",
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={badge.variant}>
                                  {badge.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarImage
                                      alt={log.userName}
                                      src={log.userImage ?? undefined}
                                    />
                                    <AvatarFallback className="text-[10px]">
                                      {getUserInitials(log.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="max-w-30 truncate text-sm">
                                    {log.userName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {log.resourceType}
                                {log.resourceId
                                  ? `:${log.resourceId.slice(0, 8)}`
                                  : ""}
                              </TableCell>
                              <TableCell className="max-w-104">
                                <div className="space-y-0.5">
                                  <p className="truncate font-medium text-sm">
                                    {formatAction(log.action)}
                                  </p>
                                  <p className="truncate text-muted-foreground text-xs">
                                    {getDetailsSummary(log.details)}
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    <InfiniteScroll
                      fetchNextPage={logsQuery.fetchNextPage}
                      hasNextPage={logsQuery.hasNextPage}
                      isFetchingNextPage={logsQuery.isFetchingNextPage}
                      isManual
                    />
                  </>
                )}
              </div>
            </ResizablePanel>

            {isDetailsOpen && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize={isMobile ? "100%" : "50%"}
                  minSize={isMobile ? "0%" : "22%"}
                >
                  <aside className="h-full overflow-auto p-4">
                    {!selectedLog ? (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia>
                            <IconAlertCircle />
                          </EmptyMedia>
                          <EmptyTitle>Select a log</EmptyTitle>
                          <EmptyDescription>
                            Choose a row to inspect full event details.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getLogOutcome(selectedLog.action) === "failed" ? (
                              <IconAlertCircle className="size-4 text-destructive" />
                            ) : getLogOutcome(selectedLog.action) ===
                              "in_progress" ? (
                              <IconClock className="size-4 text-muted-foreground" />
                            ) : (
                              <IconCircleCheck className="size-4 text-emerald-500" />
                            )}
                            <h2 className="font-medium text-base">
                              Event details
                            </h2>
                            <div className="ml-auto flex items-center gap-1">
                              <Separator
                                className="mx-2 h-auto"
                                orientation="vertical"
                              />
                              <Button
                                aria-label="Collapse details panel"
                                onClick={() => setIsDetailsOpen(false)}
                                size="icon-lg"
                                variant="ghost"
                              >
                                <IconX className="size-5" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {formatAction(selectedLog.action)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {format(new Date(selectedLog.timestamp), "PPpp")} ({" "}
                            {formatDistanceToNow(
                              new Date(selectedLog.timestamp),
                              {
                                addSuffix: true,
                              },
                            )}
                            )
                          </p>
                        </div>

                        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                          <p className="font-medium text-xs uppercase tracking-wide">
                            Actor
                          </p>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage
                                alt={selectedLog.userName}
                                src={selectedLog.userImage ?? undefined}
                              />
                              <AvatarFallback className="text-[10px]">
                                {getUserInitials(selectedLog.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm">{selectedLog.userName}</p>
                              <p className="text-muted-foreground text-xs">
                                {selectedLog.userEmail}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                          <p className="font-medium text-xs uppercase tracking-wide">
                            Resource
                          </p>
                          <p className="font-mono text-xs">
                            {selectedLog.resourceType}
                          </p>
                          <p className="font-mono text-muted-foreground text-xs">
                            {selectedLog.resourceId ?? "No resource id"}
                          </p>
                          <p className="font-mono text-muted-foreground text-xs">
                            IP: {selectedLog.ipAddress ?? "Unknown"}
                          </p>
                        </div>

                        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                          <p className="font-medium text-xs uppercase tracking-wide">
                            Payload
                          </p>
                          <pre className="max-h-64 overflow-auto rounded-md bg-background p-2 font-mono text-xs">
                            {JSON.stringify(selectedLog.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </aside>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  )
}
