"use client"

import { IconSearch, IconX } from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
export function SearchSSHKeySection() {
  return (
    <Suspense fallback={<SearchSSHKeySection.Skeleton />}>
      <ErrorBoundary fallback={<SearchSSHKeySection.Error />}>
        <SearchSSHKeySectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function SearchSSHKeySectionSuspense() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlQuery = searchParams.get("query") ?? ""
  const searchString = searchParams.toString()

  const [isPending, startTransition] = React.useTransition()
  const [input, setInput] = React.useState(urlQuery)

  React.useEffect(() => {
    setInput(urlQuery)
  }, [urlQuery])

  React.useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchString)
      if (input) params.set("query", input)
      else params.delete("query")

      const q = params.toString()
      if (q !== searchString) {
        startTransition(() => {
          router.replace(q ? `${pathname}?${q}` : pathname)
        })
      }
    }, 300)
    return () => clearTimeout(id)
  }, [input, router, pathname, searchString])

  const [sshKeys, query] = api.sshKey.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const filteredPages = sshKeys.pages.map((page) => ({
    ...page,
    items: page.items.filter((item) =>
      item.name.toLowerCase().includes(urlQuery.toLowerCase()),
    ),
  }))

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <ButtonGroup className="w-full">
        <InputGroup className="h-12 border-border bg-card dark:bg-card">
          <InputGroupInput
            className="text-base placeholder:text-base"
            name="query"
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search SSH keys..."
            value={input}
          />
          <InputGroupAddon>
            <IconSearch className="size-5" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end" className="text-base">
            {query.isFetching || isPending ? (
              <Spinner />
            ) : (
              filteredPages.reduce((acc, page) => acc + page.items.length, 0)
            )}{" "}
            results
          </InputGroupAddon>
        </InputGroup>
        <Button
          className="h-12 border-border dark:border-input"
          onClick={() => {
            setInput("")
            const params = new URLSearchParams(searchString)
            params.delete("query")
            const q = params.toString()
            startTransition(() => {
              router.replace(q ? `${pathname}?${q}` : pathname)
            })
          }}
          type="reset"
          variant="secondary"
        >
          <IconX />
        </Button>
      </ButtonGroup>
    </form>
  )
}

SearchSSHKeySection.Skeleton = () => (
  <ButtonGroup className="w-full">
    <InputGroup className="h-12 border-border bg-card dark:bg-card">
      <InputGroupInput
        className="text-base placeholder:text-base"
        disabled
        placeholder="Search SSH keys..."
      />
      <InputGroupAddon>
        <IconSearch className="size-5" />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end" className="text-base">
        <Spinner /> results
      </InputGroupAddon>
    </InputGroup>
    <Button className="h-12" disabled variant="secondary">
      <IconX />
    </Button>
  </ButtonGroup>
)

SearchSSHKeySection.Error = () => (
  <ButtonGroup className="w-full">
    <InputGroup className="h-12 border-border bg-card dark:bg-card">
      <InputGroupInput
        className="text-base placeholder:text-base"
        disabled
        placeholder="Search SSH keys..."
      />
      <InputGroupAddon>
        <IconSearch className="size-5" />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end" className="text-base">
        <IconX /> results
      </InputGroupAddon>
    </InputGroup>
    <Button className="h-12" disabled variant="secondary">
      <IconX />
    </Button>
  </ButtonGroup>
)
