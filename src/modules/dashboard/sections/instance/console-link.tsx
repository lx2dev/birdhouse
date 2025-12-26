"use client"

import {
  IconCheck,
  IconCopy,
  IconExclamationCircleFilled,
  IconTerminal,
} from "@tabler/icons-react"
import type { User } from "better-auth"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { getInstanceSSHCommand, getInstanceSSHUrl } from "@/lib/utils"
import type {
  OperatingSystemTable,
  VMTable,
  VMTemplateTable,
} from "@/server/db/schema"

interface InstanceConsoleSectionProps {
  instance: VMTable & {
    os: OperatingSystemTable
    template: VMTemplateTable
  }
  user: User
}

export function InstanceConsoleSection({
  instance,
  user,
}: InstanceConsoleSectionProps) {
  return (
    <Suspense fallback={<InstanceConsoleSection.Skeleton />}>
      <ErrorBoundary fallback={<InstanceConsoleSection.Error />}>
        <InstanceConsoleSectionSuspense instance={instance} user={user} />
      </ErrorBoundary>
    </Suspense>
  )
}

function InstanceConsoleSectionSuspense({
  instance,
  user,
}: InstanceConsoleSectionProps) {
  const [copied, setCopied] = React.useState<boolean>(false)

  function handleCopyCommand() {
    if (instance.status !== "running") {
      toast.error("Instance is not running")
      return
    }

    try {
      const command = getInstanceSSHCommand(instance.id, user.name)
      navigator.clipboard.writeText(command)
      toast.success("SSH command copied to clipboard")
      setCopied(true)
    } catch (error) {
      console.error("Error copying SSH command:", error)
      toast.error("Failed to copy SSH command")
      return
    } finally {
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTerminal className="size" />
          SSH Console Access
        </CardTitle>
        <CardDescription>
          Connect to your instance through ssh using your preferred terminal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ButtonGroup>
          <Button
            disabled
            // disabled={instance.status !== "running"}
            nativeButton={false}
            render={
              <a
                aria-disabled
                // aria-disabled={instance.status !== "running"}
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                href={getInstanceSSHUrl(instance.id, user.name)}
              >
                <IconTerminal className="size-4" />
                Open Console
              </a>
            }
            size="lg"
            variant="outline"
          />
          <Button
            disabled
            // disabled={instance.status !== "running"}
            onClick={handleCopyCommand}
            size="icon-lg"
            variant="outline"
          >
            {copied ? (
              <IconCheck className="size-4 text-green-500" />
            ) : (
              <IconCopy className="size-4" />
            )}
            <span className="sr-only">Copy Command</span>
          </Button>
        </ButtonGroup>
      </CardContent>
    </Card>
  )
}

InstanceConsoleSection.Skeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <IconTerminal className="size" />
        Console Access
      </CardTitle>
      <CardDescription>
        Access your instance through web-based terminal
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-40" />
    </CardContent>
  </Card>
)

InstanceConsoleSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Error Loading</EmptyTitle>
      <EmptyDescription>
        There was an error loading the console access section. Please try again
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
