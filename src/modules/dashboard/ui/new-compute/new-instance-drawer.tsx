"use client"

import { IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type { InstanceInsert } from "@/server/db/schema"

import { StepRow } from "./step-row"
import type { CreationPhase, StepStatus } from "./types"

interface NewInstanceDrawerProps {
  createdInstance: Pick<InstanceInsert, "id" | "name" | "sshKeyId"> | null
  creationPhase: CreationPhase
  drawerOpen: boolean
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function NewInstanceDrawer(props: NewInstanceDrawerProps) {
  const { creationPhase, createdInstance, drawerOpen, setDrawerOpen } = props

  const steps = getProvisionSteps({
    creationPhase,
    hasSshKey: Boolean(createdInstance?.sshKeyId),
  })

  const drawerDescription = createdInstance
    ? `Provisioning ${createdInstance.name}`
    : "Preparing your new instance"

  return (
    <Drawer
      onOpenChange={(open) => {
        if (open) return
        setDrawerOpen(false)
      }}
      open={drawerOpen}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="border-border border-b px-0 text-left!">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <DrawerTitle>Provisioning Console</DrawerTitle>
                <DrawerDescription>{drawerDescription}</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button size="sm" variant="ghost">
                  <IconX className="size-4" />
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="space-y-4 pt-4 pb-6">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="font-semibold text-sm">Status</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-foreground/90 px-2.5 py-1 font-mono text-[11px] text-background">
                  {getStatusLabel(creationPhase)}
                </span>
                <span className="text-muted-foreground text-xs">
                  {getStatusDetail(creationPhase)}
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
              <p className="font-semibold text-sm">Provisioning steps</p>
              <div className="space-y-3">
                {steps.map((step) => (
                  <StepRow
                    description={step.description}
                    key={step.id}
                    status={step.status}
                    title={step.title}
                  />
                ))}
              </div>
            </div>

            {creationPhase === "error" && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                <p className="font-semibold text-destructive text-sm">
                  Provisioning paused
                </p>
                <p className="mt-1 text-destructive/80 text-xs">
                  Something went wrong while creating your instance. You can
                  close this drawer, adjust your settings, and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface ProvisionStepProps {
  creationPhase: CreationPhase
  hasSshKey: boolean
}

function getProvisionSteps({ creationPhase, hasSshKey }: ProvisionStepProps) {
  const steps: Array<{
    id: string
    title: string
    description: string
    status: StepStatus
  }> = [
    {
      description: "We queued your instance request.",
      id: "start",
      status:
        creationPhase === "creating" ||
        creationPhase === "provisioning" ||
        creationPhase === "complete" ||
        creationPhase === "error"
          ? "done"
          : "pending",
      title: "Creation started",
    },
    {
      description: "Cloning the template in the background.",
      id: "base",
      status:
        creationPhase === "provisioning"
          ? "in-progress"
          : creationPhase === "complete"
            ? "done"
            : creationPhase === "error"
              ? "error"
              : "pending",
      title: "Preparing base image",
    },
    {
      description: hasSshKey
        ? "SSH key will be added for secure login."
        : "No SSH key selected. Password login will be ready.",
      id: "access",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Setting up access",
    },
    {
      description: "Login information is being prepared.",
      id: "user",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Saving user details",
    },
    {
      description: "Booting the VM on the host.",
      id: "boot",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Starting instance",
    },
    {
      description: "Redirecting you to the instance page.",
      id: "done",
      status: creationPhase === "complete" ? "done" : "pending",
      title: "Creation complete",
    },
  ]

  return steps
}

function getStatusLabel(creationPhase: CreationPhase) {
  switch (creationPhase) {
    case "creating":
      return "Creation started"
    case "provisioning":
      return "Provisioning"
    case "complete":
      return "Complete"
    case "error":
      return "Needs attention"
    default:
      return "Idle"
  }
}

function getStatusDetail(creationPhase: CreationPhase) {
  switch (creationPhase) {
    case "creating":
      return "Submitting your request to the cluster."
    case "provisioning":
      return "This can take a few minutes."
    case "complete":
      return "Taking you to your new instance."
    case "error":
      return "Review the form and try again."
    default:
      return "Ready when you are."
  }
}
