"use client"

import {
  IconArrowLeft,
  IconExclamationCircleFilled,
  IconTerminal,
} from "@tabler/icons-react"
import Link from "next/link"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { api } from "@/lib/api/client"
import { VNCConsole } from "@/modules/dashboard/ui/vnc-console"

export function InstanceConsole({ id }: { id: string }) {
  return (
    <Suspense fallback={<InstanceConsole.Skeleton />}>
      <ErrorBoundary fallback={<InstanceConsole.Error />}>
        <InstanceConsoleSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  )
}

function InstanceConsoleSuspense({ id }: { id: string }) {
  const [instance] = api.compute.getInstance.useSuspenseQuery({ id })
  const [vncAccess] = api.console.getVNCAccess.useSuspenseQuery({ id })

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          nativeButton={false}
          render={
            <Link href={`/dashboard/compute/${instance.id}`}>
              <IconArrowLeft />
            </Link>
          }
          size="icon"
          variant="ghost"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <IconTerminal className="size-6" />
            <h1 className="font-bold text-3xl tracking-tight">
              Console - {instance.name}
            </h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Web-based terminal access
          </p>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Tip:</strong> Use Ctrl+Alt+Del to send special key
          combinations to the VM. Right-click to access clipboard options.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTerminal className="size-5" />
            Terminal
          </CardTitle>
          <CardDescription>
            Direct console access to your virtual machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vncAccess ? (
            <VNCConsole
              host={vncAccess.host}
              node={vncAccess.node}
              port={vncAccess.port}
              ticket={vncAccess.ticket}
              vmid={vncAccess.vmid}
            />
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

InstanceConsole.Skeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="size-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>

    <Skeleton className="h-12" />

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTerminal className="size-5" />
          <span>Terminal</span>
        </CardTitle>
        <CardDescription>
          Direct console access to your virtual machine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[58vh] w-full" />
        <div>
          <Skeleton className="mx-auto mt-4 h-6 w-1/6" />
        </div>
      </CardContent>
    </Card>
  </div>
)

InstanceConsole.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Failed to load instance console</EmptyTitle>
      <EmptyDescription>
        There was an error while trying to load the instance console. Please try
        again later.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
