"use client"

import {
  IconExclamationCircleFilled,
  IconServer,
  IconServerCog,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

export function QuickActionsSection() {
  return (
    <Suspense fallback={<QuickActionsSection.Skeleton />}>
      <ErrorBoundary fallback={<QuickActionsSection.Error />}>
        <QuickActionsSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function QuickActionsSuspense() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/users">
          <Item className="transition-colors hover:bg-accent" variant="outline">
            <ItemMedia
              className="size-10 rounded-lg bg-primary/10"
              variant="icon"
            >
              <IconUsers className="size-5 text-primary" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Manage Users</ItemTitle>
              <ItemDescription>
                Approve and manage user accounts
              </ItemDescription>
            </ItemContent>
          </Item>
        </Link>

        <Link href="/admin/vms">
          <Item className="transition-colors hover:bg-accent" variant="outline">
            <ItemMedia
              className="size-10 rounded-lg bg-primary/10"
              variant="icon"
            >
              <IconServer className="size-5 text-primary" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>View All VMs</ItemTitle>
              <ItemDescription>Monitor all virtual machines</ItemDescription>
            </ItemContent>
          </Item>
        </Link>

        <Link href="/admin/templates">
          <Item className="transition-colors hover:bg-accent" variant="outline">
            <ItemMedia
              className="size-10 rounded-lg bg-primary/10"
              variant="icon"
            >
              <IconServerCog className="size-5 text-primary" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Manage Templates</ItemTitle>
              <ItemDescription>Create and edit VM templates</ItemDescription>
            </ItemContent>
          </Item>
        </Link>
      </CardContent>
    </Card>
  )
}

QuickActionsSection.Skeleton = () => <Card className="h-32 animate-pulse" />

QuickActionsSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle className="text-base">
        Failed to load quick actions
      </EmptyTitle>
      <EmptyDescription>
        There was an error while loading the quick actions. Please try again
        later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
