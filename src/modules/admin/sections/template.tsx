"use client"

import {
  IconExclamationCircleFilled,
  IconPower,
  IconQuestionMark,
  IconServerCog,
} from "@tabler/icons-react"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { InfiniteScroll } from "@/components/infinite-scroll"
import type { QueryControlsValue } from "@/components/query-controls"
import QueryControls from "@/components/query-controls"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { CreateTemplateDialog } from "@/modules/admin/ui/create-template-dialog"
import { EditTemplateDialog } from "@/modules/admin/ui/edit-template.dialog"
import type { VMTemplateStatus } from "@/server/db/schema"
import { vmTemplateStatusEnum } from "@/server/db/schema"

export function TemplateSection() {
  return (
    <Suspense fallback={<TemplateSection.Skeleton />}>
      <ErrorBoundary fallback={<TemplateSection.Error />}>
        <TemplateSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function TemplateSectionSuspense() {
  const [controls, setControls] = React.useState<QueryControlsValue>({
    sortBy: undefined,
    sortOrder: "desc",
    status: "any",
  })
  const [appliedControls, setAppliedControls] = React.useState(controls)

  const params = {
    limit: DEFAULT_FETCH_LIMIT,
    status: (appliedControls.status ?? "any") as "any",
    ...(appliedControls.sortBy && {
      sortBy: appliedControls.sortBy as
        | "cpuCores"
        | "name"
        | "createdAt"
        | "diskGb"
        | "displayName"
        | "memoryMb",
      sortOrder: appliedControls.sortOrder,
    }),
  } as const

  const [templates, query] = api.template.list.useSuspenseInfiniteQuery(
    params,
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  function getStatusColor(status: VMTemplateStatus) {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "unavailable":
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
      case "testing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
    }
  }

  return templates.pages.flatMap((page) => page.items).length === 0 ? (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconQuestionMark />
        </EmptyMedia>
        <EmptyTitle>No templates yet</EmptyTitle>
        <EmptyDescription>
          Create templates to start deploying compute instances.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateTemplateDialog variant="outline" />
      </EmptyContent>
    </Empty>
  ) : (
    <>
      <div className="mb-4">
        <QueryControls
          onApply={() => setAppliedControls(controls)}
          onChange={setControls}
          onReset={() => {
            const reset: QueryControlsValue = {
              sortBy: undefined,
              sortOrder: "desc",
              status: "any",
            }
            setControls(reset)
            setAppliedControls(reset)
          }}
          sortOptions={[
            { label: "Created At", value: "createdAt" },
            { label: "Name", value: "displayName" },
            { label: "CPU Cores", value: "cpuCores" },
            { label: "Memory", value: "memoryMb" },
            { label: "Disk", value: "diskGb" },
          ]}
          statusOptions={vmTemplateStatusEnum.enumValues.map((v) => ({
            label: v,
            value: v,
          }))}
          value={controls}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.pages
          .flatMap((page) => page.items)
          .map((template) => (
            <Card className="relative overflow-visible" key={template.id}>
              {vmTemplateStatusEnum.enumValues.includes(template.status) && (
                <div className="-top-2.5 absolute right-1/2 z-10 translate-x-1/2 rounded-4xl bg-card">
                  <Badge
                    className={cn(
                      "text-sm capitalize",
                      getStatusColor(template.status),
                    )}
                    variant="secondary"
                  >
                    {template.status}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconServerCog className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {template.displayName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {template.name}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="line-clamp-2 text-muted-foreground text-sm">
                  {template.description || "No description provided"}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">CPU Cores</div>
                    <div className="font-medium">{template.cpuCores}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">RAM</div>
                    <div className="font-medium">
                      {template.memoryMb / 1024} GB
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Disk</div>
                    <div className="font-medium">{template.diskGb} GB</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t pt-2">
                  <EditTemplateDialog template={template} variant="outline" />
                  <Select onValueChange={() => {}} value={template.status}>
                    <SelectTrigger className="h-7!">
                      <SelectValue className="text-foreground capitalize">
                        <IconPower />
                        {template.status}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {vmTemplateStatusEnum.enumValues.map((status) => (
                        <SelectItem
                          className="capitalize"
                          key={status}
                          value={status}
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      <InfiniteScroll
        fetchNextPage={query.fetchNextPage}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        isManual
      />
    </>
  )
}

TemplateSection.Skeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, idx) => (
      <Card className="animate-pulse" key={idx}>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </CardContent>
      </Card>
    ))}
  </div>
)

TemplateSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle className="text-base">Failed to load templates</EmptyTitle>
      <EmptyDescription>
        There was an error while fetching your templates. Please try again
        later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
