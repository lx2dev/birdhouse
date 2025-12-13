import {
  IconCalendar,
  IconCpu,
  IconCrop11Filled,
  IconDatabase,
  IconDotsVertical,
  IconPlayerPlayFilled,
  IconPointFilled,
  IconRotateClockwise,
  IconServer2,
  IconTerminal,
  IconTrash,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { VMStatus, VMTable } from "@/server/db/schema"

interface ComputeCardProps {
  vm: VMTable
}

export function ComputeCard({ vm }: ComputeCardProps) {
  function getStatusColor(status: VMStatus) {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "stopped":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      case "provisioning":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IconServer2 className="size-4" />
              {vm.name}
            </CardTitle>
            <Badge className={getStatusColor(vm.status)}>{vm.status}</Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="size-8" size="icon" variant="ghost">
                  <IconDotsVertical />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                // disabled={vm.status === "running" || startMutation.isPending}
                // onClick={() => startMutation.mutate({ id: vm.id })}
                className="group"
              >
                <IconPlayerPlayFilled className="group-focus:animate-pulse" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem
                // disabled={vm.status === "stopped" || stopMutation.isPending}
                // onClick={() => stopMutation.mutate({ id: vm.id })}
                className="group"
              >
                <IconCrop11Filled className="group-focus:animate-pulse" />
                Stop
              </DropdownMenuItem>
              <DropdownMenuItem
                // onClick={() => rebootMutation.mutate({ id: vm.id })}
                // disabled={vm.status !== "running" || rebootMutation.isPending}
                className="group"
              >
                <IconRotateClockwise className="group-focus:animate-spin" />
                Reboot
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                // onClick={() => handleDelete(vm.id)}
                // disabled={deleteMutation.isPending}
                className="group"
                variant="destructive"
              >
                <IconTrash className="group-focus:animate-bounce" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="font-mono text-xs">
          {vm.hostname}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCpu className="size-4" />
            <span>
              {vm.cpuCores} {vm.cpuCores === 1 ? "Core" : "Cores"}
            </span>
            <IconPointFilled className="size-3" />
            <span>{(vm.memoryMb / 1024).toFixed(1)} GB RAM</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <IconDatabase className="size-4" />
            <span>{vm.diskGb} GB Storage</span>
          </div>

          {vm.ipv4Address && (
            <div className="text-muted-foreground">
              <span className="text-xs">IP: </span>
              <span className="font-mono text-xs">{vm.ipv4Address}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="size-3" />
            <span className="text-xs">
              {formatDistanceToNow(new Date(vm.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <Link href={`/dashboard/vm/${vm.id}`}>
          <Button
            className="w-full gap-2 bg-transparent"
            size="sm"
            variant="outline"
          >
            <IconTerminal className="size-4" />
            Manage
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
