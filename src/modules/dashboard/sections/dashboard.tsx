"use client"

import {
  IconExclamationCircleFilled,
  IconPlus,
  IconServer2,
} from "@tabler/icons-react"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { ComputeCard } from "@/modules/dashboard/ui/compute-card"

export function DashboardSection() {
  return (
    <Suspense fallback={<DashboardSection.Skeleton />}>
      <ErrorBoundary fallback={<DashboardSection.Error />}>
        <DashboardSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function DashboardSectionSuspense() {
  const [vms, query] = api.vm.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  return vms.pages.flatMap((page) => page.items).length === 0 ? (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconServer2 />
        </EmptyMedia>
        <EmptyTitle>No Virtual Compute Instances</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first virtual compute instance.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/dashboard/new">
          <Button size="sm" variant="outline">
            <IconPlus />
            Create Instance
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  ) : (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vms.pages
          .flatMap((page) => page.items)
          .map((vm) => (
            <ComputeCard key={vm.id} vm={vm} />
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

DashboardSection.Skeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, idx) => (
      <Skeleton className="h-64" key={idx} />
    ))}
  </div>
)

DashboardSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Failed to load instances</EmptyTitle>
      <EmptyDescription>
        There was an error while fetching your virtual compute instances. Please
        try again later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
