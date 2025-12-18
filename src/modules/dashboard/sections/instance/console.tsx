"use client"

import {
  IconArrowLeft,
  IconExclamationCircleFilled,
  IconTerminal,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()

  const [instance] = api.compute.getInstance.useSuspenseQuery({ id })
  const [vncAccess] = api.console.getVNCAccess.useSuspenseQuery({ id })

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push(`/dashboard/vm/${instance.vmid}`)}
          size="icon"
          variant="ghost"
        >
          <IconArrowLeft className="size-4" />
        </Button>
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
          <CardTitle>Terminal</CardTitle>
          <CardDescription>
            Direct console access to your virtual machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vncAccess ? (
            <VNCConsole
              host={vncAccess.host}
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

InstanceConsole.Skeleton = () => <Skeleton className="h-8 w-3/4" />

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
