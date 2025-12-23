import {
  IconCalendar,
  IconCpu,
  IconCrop11Filled,
  IconDatabase,
  IconDotsVertical,
  IconPlayerPlayFilled,
  IconPointFilled,
  IconPower,
  IconRotateClockwise,
  IconServer2,
  IconTerminal,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import type { VMStatus, VMTable } from "@/server/db/schema"

interface InstanceCardProps {
  instance: VMTable
}

export function InstanceCard({ instance }: InstanceCardProps) {
  const router = useRouter()
  const utils = api.useUtils()

  const [forceShutdown, setForceShutdown] = React.useState<boolean>(false)
  const [open, setOpen] = React.useState<{
    delete: boolean
    shutdown: boolean
  }>({
    delete: false,
    shutdown: false,
  })

  const startMutation = api.compute.start.useMutation({
    onError(error) {
      toast.error("Failed to start instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance started")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
      router.refresh()
    },
  })
  const shutdownMutation = api.compute.shutdown.useMutation({
    onError(error) {
      toast.error("Failed to shutdown instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance shutdown initiated")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
      setForceShutdown(false)
      setOpen((prev) => ({ ...prev, shutdown: false }))
      router.refresh()
    },
  })
  const stopMutation = api.compute.stop.useMutation({
    onError(error) {
      toast.error("Failed to stop instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance stopped")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
      router.refresh()
    },
  })
  const rebootMutation = api.compute.reboot.useMutation({
    onError(error) {
      toast.error("Failed to reboot instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance rebooted")
      utils.compute.getInstance.invalidate({ id: instance.id })
      utils.compute.getInstanceStatus.invalidate({ id: instance.id })
      router.refresh()
    },
  })
  const deleteMutation = api.compute.delete.useMutation({
    onError(error) {
      toast.error("Failed to delete instance", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Instance deleted")
      utils.compute.list.invalidate()
      setOpen((prev) => ({ ...prev, delete: false }))
      router.refresh()
    },
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IconServer2 className="size-4" />
              {instance.name}
            </CardTitle>
            <Badge className={getStatusColor(instance.status)}>
              {instance.status}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={
                instance.status === "deleting" ||
                instance.status === "provisioning"
              }
              render={
                <Button className="size-8" size="icon" variant="ghost">
                  <IconDotsVertical />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={
                  <Link href={`/dashboard/compute/${instance.id}/console`}>
                    <IconTerminal />
                    Console
                  </Link>
                }
              />

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel>Power Actions</DropdownMenuLabel>

                <DropdownMenuItem
                  className="group text-green-500"
                  disabled={
                    instance.status !== "stopped" || startMutation.isPending
                  }
                  onClick={() => startMutation.mutate({ id: instance.id })}
                >
                  <IconPlayerPlayFilled className="group-focus:animate-pulse" />
                  Start
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="group text-yellow-500"
                  disabled={
                    instance.status !== "running" || shutdownMutation.isPending
                  }
                  onClick={() => {
                    setOpen((prev) => ({
                      ...prev,
                      shutdown: true,
                    }))
                  }}
                >
                  <IconPower className="group-focus:animate-pulse" />
                  Shutdown
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="group text-destructive"
                  disabled={
                    instance.status !== "running" || stopMutation.isPending
                  }
                  onClick={() => stopMutation.mutate({ id: instance.id })}
                >
                  <IconCrop11Filled className="group-focus:animate-pulse" />
                  Stop
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="group text-primary"
                  disabled={
                    instance.status !== "running" || rebootMutation.isPending
                  }
                  onClick={() => rebootMutation.mutate({ id: instance.id })}
                >
                  <IconRotateClockwise className="group-focus:animate-spin" />
                  Reboot
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="group"
                disabled={
                  deleteMutation.isPending ||
                  instance.status === "provisioning" ||
                  instance.status === "running"
                }
                onClick={() => {
                  setOpen((prev) => ({
                    ...prev,
                    delete: true,
                  }))
                }}
                variant="destructive"
              >
                <IconTrash className="group-focus:animate-bounce" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="font-mono text-xs">
          {instance.hostname}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCpu className="size-4" />
            <span>
              {instance.cpuCores} {instance.cpuCores === 1 ? "Core" : "Cores"}
            </span>
            <IconPointFilled className="size-3" />
            <span>{(instance.memoryMb / 1024).toFixed(1)} GB RAM</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <IconDatabase className="size-4" />
            <span>{instance.diskGb} GB Storage</span>
          </div>

          {instance.ipv4Address && (
            <div className="text-muted-foreground">
              <span className="text-xs">IP: </span>
              <span className="font-mono text-xs">{instance.ipv4Address}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="size-3" />
            <span className="text-xs">
              {formatDistanceToNow(new Date(instance.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <Button
          className="w-full gap-2 bg-transparent"
          disabled={instance.status === "deleting"}
          nativeButton={false}
          render={
            <Link href={`/dashboard/compute/${instance.id}`}>
              <IconTerminal className="size-4" />
              Details
            </Link>
          }
          size="sm"
          variant="outline"
        />
      </CardContent>

      <AlertDialog
        onOpenChange={(isOpen) => {
          setOpen((prev) => ({ ...prev, shutdown: isOpen }))
        }}
        open={open.shutdown}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Shutdown Virtual Machine?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to shutdown this virtual machine? Unsaved
              data may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Label className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-aria-checked:border-yellow-500/50 has-aria-checked:bg-yellow-500/10">
            <Checkbox
              className="data-checked:border-yellow-500 data-checked:bg-yellow-500 data-checked:text-white dark:data-checked:bg-yellow-500/80"
              onCheckedChange={(checked) => {
                setForceShutdown(checked as boolean)
              }}
            />
            <div className="grid gap-1.5 font-normal">
              <p className="font-medium text-sm leading-none">
                Force Shutdown (Hard Power Off)
              </p>
              <p className="text-muted-foreground text-sm">
                Enabling this may lead to data loss or corruption.
              </p>
            </div>
          </Label>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                deleteMutation.isPending ||
                instance.status === "provisioning" ||
                instance.status === "running"
              }
            >
              <IconX /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-yellow-500 text-background"
              disabled={
                deleteMutation.isPending ||
                instance.status === "provisioning" ||
                instance.status === "running"
              }
              onClick={() =>
                shutdownMutation.mutate({
                  force: forceShutdown,
                  id: instance.id,
                })
              }
            >
              {shutdownMutation.isPending ? <Spinner /> : <IconPower />}
              Shutdown
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(isOpen) =>
          setOpen((prev) => ({ ...prev, delete: isOpen }))
        }
        open={open.delete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Virtual Machine?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              virtual machine and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              <IconX /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ id: instance.id })}
            >
              {deleteMutation.isPending ? <Spinner /> : <IconTrash />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
