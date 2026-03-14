"use client"

import { IconLogout } from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import type { Session } from "@/lib/auth/utils"
import { SessionsList } from "@/modules/settings/ui/sessions-list"

interface SessionsSectionProps {
  session: Session
}

export function SessionsSection({ session }: SessionsSectionProps) {
  return (
    <Suspense fallback={<SessionsSection.Skeleton />}>
      <ErrorBoundary fallback={<SessionsSection.Error />}>
        <SessionsSectionSuspense session={session} />
      </ErrorBoundary>
    </Suspense>
  )
}

function SessionsSectionSuspense({ session }: SessionsSectionProps) {
  const [sessions] = api.account.listSessions.useSuspenseQuery()

  const sessionCount = sessions.length

  return (
    <div>
      <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
        <div className="self-start">
          <h2 className="font-semibold text-xl tracking-tight">
            Sessions{" "}
            <span className="text-muted-foreground">({sessionCount})</span>
          </h2>
        </div>

        <div className="@md:col-span-2 col-span-1">
          <SessionsList currentSession={session} sessions={sessions} />
        </div>
      </div>
    </div>
  )
}

SessionsSection.Skeleton = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <h2 className="font-semibold text-xl tracking-tight">Sessions</h2>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="h-4 w-52" />
    </div>
    <div className="@md:ml-auto">
      <Button disabled variant="outline">
        <IconLogout /> Manage sessions
      </Button>
    </div>
  </div>
)

SessionsSection.Error = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <p className="text-destructive">Failed to load sessions</p>
    </div>
  </div>
)
