"use client"

import type * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface ResponsiveModalProps {
  mediaQuery?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ComponentProps<typeof Button>
  children: React.ReactNode
  className?: string
}

const defaultTrigger: React.ComponentProps<typeof Button> = {
  size: "default",
  variant: "outline",
}

export function ResponsiveModal({
  mediaQuery = "(min-width: 768px)",
  open,
  onOpenChange,
  trigger = defaultTrigger,
  children,
  className,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery(mediaQuery)

  const triggerProps = { ...defaultTrigger, ...trigger }

  if (isDesktop) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogTrigger
          render={
            <Button {...triggerProps} className={cn(triggerProps.className)} />
          }
        >
          {triggerProps.children}
        </DialogTrigger>
        <DialogContent className={cn("md:max-w-lg", className)}>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerTrigger asChild>
        <Button {...triggerProps} className={cn(triggerProps.className)}>
          {triggerProps.children}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={cn("min-h-[50svh]", className)}>
        <DrawerHeader hidden>
          <DrawerTitle hidden />
        </DrawerHeader>
        <div className="mx-auto w-full max-w-lg py-8">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
