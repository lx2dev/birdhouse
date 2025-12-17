"use client"

import {
  IconActivity,
  IconArrowLeft,
  IconCpu,
  IconDatabase,
  IconExclamationCircleFilled,
  IconPlayerPlayFilled,
  IconPointFilled,
  IconRefresh,
  IconServer,
  IconSquareFilled,
  IconTerminal,
  IconTrash,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
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
import { api } from "@/lib/api/client"
import type { VMStatus } from "@/server/db/schema"

export function InstanceSection({ id }: { id: string }) {
  return (
    <Suspense fallback={<InstanceSection.Skeleton />}>
      <ErrorBoundary fallback={<InstanceSection.Error />}>
        <InstanceSectionSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  )
}

function InstanceSectionSuspense({ id }: { id: string }) {
  const router = useRouter()

  const [instance, instanceQuery] = api.compute.getInstance.useSuspenseQuery({
    id,
  })
  const [status, statusQuery] = api.compute.getInstanceStatus.useSuspenseQuery({
    id,
  })

  function getStatusColor(status: VMStatus) {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "stopped":
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
      case "provisioning":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
    }
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} size="icon" variant="ghost">
          <IconArrowLeft />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-3xl tracking-tight">
              {instance.name}
            </h1>
            <Badge className={getStatusColor(instance.status)}>
              {instance.status}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-muted-foreground text-sm">
            {instance.hostname}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ButtonGroup>
          <Button
            className="gap-2"
            // disabled={vm.status === "running" || startMutation.isPending}
            // onClick={() => startMutation.mutate({ id: vmId })}
            variant="outline"
          >
            <IconPlayerPlayFilled />
            Start
          </Button>
          <Button
            className="gap-2 bg-transparent"
            // disabled={vm.status === "stopped" || stopMutation.isPending}
            // onClick={() => stopMutation.mutate({ id: vmId })}
            variant="outline"
          >
            <IconSquareFilled />
            Stop
          </Button>
          <Button
            className="gap-2 bg-transparent"
            // disabled={vm.status !== "running" || rebootMutation.isPending}
            // onClick={() => rebootMutation.mutate({ id: vmId })}
            variant="outline"
          >
            <IconRefresh />
            Reboot
          </Button>
        </ButtonGroup>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button className="ml-auto gap-2" variant="destructive">
                <IconTrash />
                Delete
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Virtual Machine?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                virtual machine and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                // onClick={() => deleteMutation.mutate({ id: vmId })}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconServer className="size-5" />
              Instance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Template</p>
              <p className="font-medium">
                {instance.template.displayName || "Unknown"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconCpu className="size-4 text-muted-foreground" />
              <span className="flex items-center gap-1">
                {instance.cpuCores} {instance.cpuCores === 1 ? "Core" : "Cores"}
                <IconPointFilled className="size-3" />
                {(instance.memoryMb / 1024).toFixed(1)} GB RAM
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconDatabase className="size-4 text-muted-foreground" />
              <span>{instance.diskGb} GB Storage</span>
            </div>
            {instance.ipv4Address && (
              <div>
                <p className="text-muted-foreground text-sm">IPv4 Address</p>
                <p className="font-mono">{instance.ipv4Address}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-sm">Created</p>
              <p>
                {formatDistanceToNow(new Date(instance.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="size-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* {status ? (
              <>
                <div>
                  <p className="text-muted-foreground text-sm">CPU Usage</p>
                  <p className="font-bold text-2xl">
                    {(status.cpuUsage * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Memory Usage</p>
                  <p className="font-bold text-2xl">
                    {((status.memoryUsed / status.memoryTotal) * 100).toFixed(
                      1,
                    )}
                    %
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {(status.memoryUsed / 1024 / 1024 / 1024).toFixed(2)} GB /{" "}
                    {(status.memoryTotal / 1024 / 1024 / 1024).toFixed(2)} GB
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Uptime</p>
                  <p className="font-medium text-lg">
                    {Math.floor(status.uptime / 86400)}d{" "}
                    {Math.floor((status.uptime % 86400) / 3600)}h{" "}
                    {Math.floor((status.uptime % 3600) / 60)}m
                  </p>
                </div>
              </>
            ) : ( */}
            <p className="text-muted-foreground">
              Performance data unavailable
            </p>
            {/* )} */}
          </CardContent>
        </Card>
      </div>

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
          <Link href={`/dashboard/compute/${id}/console`}>
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
    </>
  )
}

InstanceSection.Skeleton = () => (
  <div>
    <h1>Loading instance details...</h1>
  </div>
)

InstanceSection.Error = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <IconExclamationCircleFilled className="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Failed to load instance details.</EmptyTitle>
      <EmptyDescription>
        Please try refreshing the page. If the problem persists, contact
        support.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
