"use client"

import { IconCheck, IconCopy } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item"
import type { SSHKeyTable } from "@/server/db/schema"

interface SSHKeyItemProps {
  item: SSHKeyTable
}

// TODO: Fix overflow
export function SSHKeyItem({ item: key }: SSHKeyItemProps) {
  const [copy, setCopy] = React.useState<{
    field: "publicKey" | "fingerprint" | null
    timeoutId: NodeJS.Timeout | null
  }>({
    field: null,
    timeoutId: null,
  })

  function handleCopy(field: "publicKey" | "fingerprint") {
    navigator.clipboard.writeText(key[field])
    if (copy.timeoutId) {
      clearTimeout(copy.timeoutId)
    }
    const timeoutId = setTimeout(() => {
      setCopy({ field: null, timeoutId: null })
    }, 2000)
    setCopy({ field, timeoutId })
  }

  return (
    <Item className="not-last:mb-4" variant="outline">
      <ItemContent className="min-w-0">
        <ItemTitle>{key.name}</ItemTitle>
        <ItemDescription className="space-y-2">
          <span className="flex items-center justify-between rounded-(--radius) bg-muted p-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 font-medium">Public Key:</span>
              <code className="truncate font-mono text-xs">
                {key.publicKey}
              </code>
            </span>
            <Button
              className="ml-auto h-auto"
              onClick={() => handleCopy("publicKey")}
              size="icon"
              variant="ghost"
            >
              {copy.field === "publicKey" ? (
                <IconCheck className="text-green-500" />
              ) : (
                <IconCopy />
              )}
            </Button>
          </span>
          <span className="flex items-center justify-between rounded-(--radius) bg-muted p-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 font-medium">Fingerprint:</span>
              <code className="truncate font-mono text-xs">
                {key.fingerprint}
              </code>
            </span>
            <Button
              className="ml-auto h-auto"
              onClick={() => handleCopy("fingerprint")}
              size="icon"
              variant="ghost"
            >
              {copy.field === "fingerprint" ? (
                <IconCheck className="text-green-500" />
              ) : (
                <IconCopy />
              )}
            </Button>
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Open
        </Button>
      </ItemActions>
      <ItemFooter className="text-muted-foreground text-sm">
        Added{" "}
        {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
      </ItemFooter>
    </Item>
  )
}
