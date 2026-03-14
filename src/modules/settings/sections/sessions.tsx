"use client"

import { IconLogout } from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { RouterOutputs } from "@/lib/api/client"
import { api } from "@/lib/api/client"
import type { Session } from "@/lib/auth/utils"
import { SessionsList } from "@/modules/settings/ui/sessions-list"

interface SessionsSectionProps {
  session: Session
}

export function SessionsSection({ session }: SessionsSectionProps) {
  const [sessions] = api.account.listSessions.useSuspenseQuery()

  const sessionCount = sessions.length

  return (
    <Suspense
      fallback={<SessionsSection.Skeleton sessionCount={sessionCount} />}
    >
      <ErrorBoundary fallback={<SessionsSection.Error />}>
        <SessionsSectionSuspense
          currentSession={session}
          sessionCount={sessionCount}
          sessions={sessions}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

interface SessionsSectionSuspenseProps {
  currentSession: Session
  sessionCount: number
  sessions: RouterOutputs["account"]["listSessions"]
}

function SessionsSectionSuspense({
  currentSession,
  sessionCount,
  sessions,
}: SessionsSectionSuspenseProps) {
  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">
          Sessions{" "}
          <span className="text-muted-foreground">({sessionCount})</span>
        </h2>
      </div>

      <div className="@md:col-span-2 col-span-1">
        <SessionsList currentSession={currentSession} sessions={sessions} />
      </div>
    </div>
  )
}

SessionsSection.Skeleton = ({ sessionCount }: { sessionCount: number }) => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <h2 className="flex items-center font-semibold text-xl tracking-tight">
        Sessions <Skeleton className="ml-1.5 size-6" />
      </h2>
    </div>
    <div className="@md:col-span-2 col-span-1">
      <div className="flex flex-col gap-2">
        <Button className="ml-auto" disabled variant="outline">
          <IconLogout /> Revoke other sessions
        </Button>

        {sessionCount > 0 && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: sessionCount }).map((_, i) => (
              <Skeleton className="h-16 w-full" key={i} />
            ))}
          </div>
        )}
      </div>
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
