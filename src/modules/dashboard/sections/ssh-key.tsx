"use client"

import { IconKeyFilled, IconPlus } from "@tabler/icons-react"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { CreateSSHKeyDialog } from "@/modules/dashboard/ui/create-ssh-key-dialog"
import { SSHKeyItem } from "@/modules/dashboard/ui/ssh-key-item"

export function SSHKeySection() {
  return (
    <Suspense fallback={<SSHKeySection.Skeleton />}>
      <ErrorBoundary fallback={<SSHKeySection.Error />}>
        <SSHKeySectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function SSHKeySectionSuspense() {
  const searchParams = useSearchParams()
  const sshKeyQuery = searchParams.get("query")

  const [open, setOpen] = React.useState<boolean>(false)

  const [sshKeys, query] = api.sshKey.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const filteredSSHKeys = React.useMemo(() => {
    if (!sshKeyQuery) {
      return sshKeys
    }

    const filteredPages = sshKeys.pages.map((page) => {
      const filteredItems = page.items.filter((key) =>
        key.name.toLowerCase().includes(sshKeyQuery.toLowerCase()),
      )
      return { ...page, items: filteredItems }
    })

    return {
      ...sshKeys,
      pages: filteredPages,
    }
  }, [sshKeys, sshKeyQuery])

  return (
    <div>
      <CreateSSHKeyDialog onOpenChange={setOpen} open={open} />
      <Card>
        <CardContent>
          {sshKeys.pages.flatMap((page) => page.items).length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia className="size-14" variant="icon">
                  <IconKeyFilled className="size-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle className="text-lg">No SSH keys yet</EmptyTitle>
                <EmptyDescription>
                  Add SSH keys to securely access your instances
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setOpen(true)} variant="outline">
                  <IconPlus />
                  Add SSH Key
                </Button>
              </EmptyContent>
            </Empty>
          ) : filteredSSHKeys.pages.flatMap((page) => page.items).length ===
            0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia className="size-14" variant="icon">
                  <IconKeyFilled className="size-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle className="text-lg">No SSH keys found</EmptyTitle>
                <EmptyDescription>
                  We couldn&apos;t find any SSH keys matching your search.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            filteredSSHKeys.pages
              .flatMap((page) => page.items)
              .map((key) => <SSHKeyItem item={key} key={key.id} />)
          )}
        </CardContent>
      </Card>
      <InfiniteScroll
        fetchNextPage={query.fetchNextPage}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        isManual
      />
    </div>
  )
}

SSHKeySection.Skeleton = () => (
  <Card>
    <CardContent>
      <div className="space-y-4">
        {[...Array(DEFAULT_FETCH_LIMIT)].map((_, idx) => (
          <div
            className="h-10 w-full animate-pulse rounded-md bg-muted"
            key={idx}
          />
        ))}
      </div>
    </CardContent>
  </Card>
)

SSHKeySection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyTitle className="text-lg">Failed to load SSH keys</EmptyTitle>
      <EmptyDescription>
        There was an error loading your SSH keys. Please try again later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
