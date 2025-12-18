"use client"

import { IconExclamationCircleFilled, IconTerminal } from "@tabler/icons-react"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Button } from "@/components/ui/button"
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
}

export function InstanceConsoleSection({
  instance,
}: InstanceConsoleSectionProps) {
  return (
    <Suspense fallback={<InstanceConsoleSection.Skeleton />}>
      <ErrorBoundary fallback={<InstanceConsoleSection.Error />}>
        <InstanceConsoleSectionSuspense instance={instance} />
      </ErrorBoundary>
    </Suspense>
  )
}

function InstanceConsoleSectionSuspense({
  instance,
}: InstanceConsoleSectionProps) {
  return (
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
        <Link href={`/dashboard/compute/${instance.id}/console`}>
          <Button
            disabled={instance.status !== "running"}
            size="lg"
            variant="outline"
          >
            <IconTerminal className="size-4" />
            Open Console
          </Button>
        </Link>
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
