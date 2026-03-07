"use client"

import { IconArrowLeft, IconHeartHandshake } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function GoodbyePage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-12 md:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-8 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-10 -bottom-16 size-64 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl rounded-3xl border bg-background/80 p-8 text-center shadow-xl backdrop-blur-sm md:p-12">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full border bg-muted text-primary">
          <IconHeartHandshake className="size-6" />
        </span>

        <p className="mt-6 font-semibold text-muted-foreground text-xs uppercase tracking-[0.16em]">
          Account removed
        </p>
        <h1 className="mt-3 text-balance font-semibold text-4xl tracking-tight md:text-5xl">
          Your Birdhouse has been closed.
        </h1>
        <p className="mt-5 text-pretty text-muted-foreground md:text-lg">
          Your account and related access have been deleted. Thank you for being
          part of Birdhouse, and for trusting us with your infrastructure.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="h-12 px-6 text-base"
            nativeButton={false}
            render={<Link href="/" />}
            size="lg"
          >
            <IconArrowLeft />
            Back to home
          </Button>

          <Button
            className="h-12 px-6 text-base"
            nativeButton={false}
            render={<Link href="/support" />}
            size="lg"
            variant="outline"
          >
            Contact support
          </Button>
        </div>
      </div>
    </main>
  )
}
