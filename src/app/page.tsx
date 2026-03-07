import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"

import { Icons } from "@/components/icons"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth/utils"
import { cn } from "@/lib/utils"

export default async function HomePage() {
  const session = await getSession()

  const primaryHref = session ? "/dashboard" : "/auth/signin"
  const primaryLabel = session ? "Open dashboard" : "Sign in"

  return (
    <main className="relative min-h-svh overflow-hidden px-6 py-10 md:px-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--muted)_0%,transparent_20%,transparent_80%,var(--muted)_100%)] opacity-35" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[42px_42px] opacity-45" />

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-b pb-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-md border bg-background/90 p-1.5">
            <Icons.logo className="size-5" />
          </span>
          <p className="font-semibold text-xs uppercase tracking-[0.16em]">
            Birdhouse
          </p>
        </div>
        <p className="hidden text-muted-foreground text-xs md:block">
          Proxmox management platform
        </p>
      </div>

      <section className="mx-auto grid w-full max-w-7xl gap-8 lg:min-h-[calc(100svh-11.5rem)] lg:grid-cols-[0.95fr_1.2fr] lg:gap-12">
        <div className="@container flex h-full flex-col justify-center">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.16em]">
            Control plane
          </p>
          <h1
            className={cn(
              "mt-3 max-w-xl text-balance font-semibold tracking-tight",
              // default
              "text-(--tw-leading,var(--text-3xl--line-height)) text-[1.85rem]",
              // sm
              "@sm:text-4xl",
              // md
              "@md:text-(--tw-leading,var(--text-5xl--line-height)) @md:text-[3rem]",
              // lg
              "@lg:text-(--tw-leading,var(--text-6xl--line-height)) @lg:text-[3.73rem]",
            )}
          >
            Your infrastructure.
            <br />
            One clear workspace.
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground md:text-lg">
            Secure auth, fast provisioning, one place for day-to-day ops.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button
              className="h-12 w-full px-6 text-base sm:w-auto"
              nativeButton={false}
              render={<Link href={primaryHref} />}
              size="lg"
            >
              {primaryLabel}
              <IconArrowRight />
            </Button>

            <Button
              className="h-12 w-full px-6 text-base sm:w-auto"
              nativeButton={false}
              render={<Link href="/docs" />}
              size="lg"
              variant="outline"
            >
              View docs
              <IconArrowUpRight />
            </Button>
          </div>

          <div className="mt-8 w-full rounded-2xl border bg-background/90 p-4">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.12em]">
              Workflow
            </p>

            <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
              <div className="rounded-lg border bg-background px-2 py-2">
                <p className="font-semibold text-sm">Compute</p>
                <p className="text-muted-foreground text-xs">Launch VMs</p>
              </div>
              <span className="text-muted-foreground/60 text-xs">01</span>

              <div className="rounded-lg border bg-background px-2 py-2">
                <p className="font-semibold text-sm">Access</p>
                <p className="text-muted-foreground text-xs">Manage keys</p>
              </div>
              <span className="text-muted-foreground/60 text-xs">02</span>

              <div className="rounded-lg border bg-background px-2 py-2">
                <p className="font-semibold text-sm">Ops</p>
                <p className="text-muted-foreground text-xs">Track events</p>
              </div>
            </div>

            <div className="mt-3 h-1 w-full rounded-full bg-muted">
              <div className="relative h-full w-2/3 overflow-hidden rounded-full bg-primary/70">
                <span className="absolute inset-y-0 w-1/3 animate-progress-shimmer bg-[linear-gradient(90deg,transparent,var(--primary),transparent)] opacity-80" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex h-full items-center lg:py-6">
          <div className="relative w-full">
            <div className="absolute -top-6 -left-6 z-0 hidden size-32 rounded-2xl border border-border/90 bg-card/60 shadow-md lg:block" />
            <div className="absolute -right-4 -bottom-5 z-0 hidden size-24 rounded-2xl border border-border/90 bg-card/60 shadow-sm lg:block" />

            <div className="relative z-10 rounded-2xl border bg-card/90 p-4 shadow-xl backdrop-blur-sm md:p-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <span className="size-2.5 rounded-full bg-muted-foreground/50" />
                <span className="size-2.5 rounded-full bg-muted-foreground/35" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <p className="ml-2 text-muted-foreground text-xs">
                  Dashboard Overview
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1.25fr_1fr]">
                <div className="rounded-xl border bg-background p-4">
                  <p className="font-medium text-sm">Instances</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-7 rounded-md bg-muted/60" />
                    <div className="h-7 rounded-md bg-muted/60" />
                    <div className="h-7 rounded-md bg-muted/60" />
                    <div className="h-7 rounded-md bg-muted/60" />
                    <div className="h-7 rounded-md bg-muted/60" />
                    <div className="h-7 rounded-md bg-muted/60" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border bg-background p-4">
                    <p className="font-medium text-sm">Provisioning Queue</p>
                    <div className="mt-3 h-24 rounded-md bg-muted/60" />
                  </div>
                  <div className="rounded-xl border bg-background p-4">
                    <p className="font-medium text-sm">Notifications</p>
                    <div className="mt-3 h-24 rounded-md bg-muted/60" />
                  </div>
                  <div className="rounded-xl border bg-background p-4">
                    <p className="font-medium text-sm">SSH Keys</p>
                    <div className="mt-3 h-14 rounded-md bg-muted/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
