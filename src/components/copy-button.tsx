"use client"

import { IconCheck, IconCopy } from "@tabler/icons-react"
import type { VariantProps } from "class-variance-authority"
import * as React from "react"

import type { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface CopyButtonProps extends VariantProps<typeof buttonVariants> {
  payload: string
  className?: string
  showText?: boolean
}

export function CopyButton({
  payload,
  size,
  variant,
  className,
  showText,
}: CopyButtonProps) {
  const isMobile = useIsMobile()

  const [copied, setCopied] = React.useState(false)

  function handleCopy() {
    if (!payload) return
    navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      className={cn(className)}
      onClick={handleCopy}
      size={size}
      variant={variant}
    >
      {!isMobile && showText ? (
        <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
      ) : null}
      {copied ? <IconCheck className="text-green-500" /> : <IconCopy />}
    </Button>
  )
}
