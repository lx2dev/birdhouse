"use client"

import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconCopy,
  IconGlobe,
  IconLogout,
  IconPointFilled,
  IconRefresh,
  IconShield,
  IconTrash,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import * as React from "react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { RouterOutputs } from "@/lib/api/client"
import { api } from "@/lib/api/client"
import type { Session } from "@/lib/auth/utils"
import { cn } from "@/lib/utils"
import {
  getDeviceIcon,
  isExpiringSoon,
  parseUserAgent,
} from "@/modules/settings/lib/utils"

interface SessionsListProps {
  currentSession: Session
  sessions: RouterOutputs["account"]["listSessions"]
}

export function SessionsList({ sessions, currentSession }: SessionsListProps) {
  const utils = api.useUtils()

  const revokeOtherSessions = api.account.revokeOtherSessions.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Other sessions revoked")
      void utils.account.listSessions.invalidate()
    },
  })

  const currentSessionToken = currentSession.session.token

  const activeSessions = sessions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((session) => new Date(session.expiresAt) >= new Date())

  return (
    <div className="flex flex-col gap-2">
      {sessions.length > 1 && (
        <Button
          className="ml-auto"
          disabled={revokeOtherSessions.isPending}
          onClick={() => {
            revokeOtherSessions.mutate()
          }}
          variant="outline"
        >
          {revokeOtherSessions.isPending ? <Spinner /> : <IconLogout />}
          Revoke other sessions
        </Button>
      )}

      <Accordion defaultValue={[currentSessionToken]}>
        {activeSessions.map((session) => (
          <SessionCard
            isCurrentSession={session.token === currentSessionToken}
            key={session.token}
            session={session}
          />
        ))}
      </Accordion>
    </div>
  )
}

interface SessionCardProps {
  session: RouterOutputs["account"]["listSessions"][number]
  isCurrentSession?: boolean
}

function SessionCard({ session, isCurrentSession = false }: SessionCardProps) {
  const utils = api.useUtils()

  const [copied, setCopied] = React.useState(false)

  const revokeSession = api.account.revokeSession.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Session revoked")
      void utils.account.listSessions.invalidate()
    },
  })

  async function handleCopyToken() {
    await navigator.clipboard.writeText(session.token)
    setCopied(true)
    toast.success("Token copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const { browser, browserVersion, os, device } = parseUserAgent(
    session.userAgent || "Unknown device",
  )
  const expiringSoon = isExpiringSoon(session.expiresAt)

  const DeviceIcon = getDeviceIcon(device)

  const statusBadge = isCurrentSession ? (
    <Badge
      className={cn(
        "gap-1 font-medium text-xs",
        "dark:border-green-400 dark:bg-green-400/10 dark:text-green-400",
        "border-green-600 bg-green-600/10 text-green-600",
      )}
      variant="outline"
    >
      <span className="inline-block size-1.5 rounded-full bg-green-600 dark:bg-green-400" />
      Current session
    </Badge>
  ) : expiringSoon ? (
    <Badge
      className={cn(
        "gap-1 font-medium text-xs",
        "dark:border-amber-400 dark:bg-amber-400/10 dark:text-amber-400",
        "border-amber-600 bg-amber-600/10 text-amber-600",
      )}
      variant="outline"
    >
      <IconClock className="size-3" />
      Expiring soon
    </Badge>
  ) : null

  return (
    <AccordionItem
      className={cn(
        "rounded-lg border transition-all duration-200",
        isCurrentSession
          ? cn(
              "border-green-600/50 bg-green-600/10 hover:bg-green-600/20",
              "dark:border-green-400/50 dark:bg-green-400/10 dark:hover:bg-green-400/20",
            )
          : "hover:bg-muted-foreground/10",
      )}
      value={session.token}
    >
      <AccordionTrigger
        aria-controls={`session-details-${session.token}`}
        className="flex items-center gap-3 px-4 hover:no-underline **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-foreground/70"
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            isCurrentSession
              ? cn(
                  "bg-green-600/10 text-green-600",
                  "dark:bg-green-400/10 dark:text-green-400",
                )
              : "bg-muted-foreground/10 text-muted-foreground",
          )}
        >
          <DeviceIcon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-foreground text-sm">
              {browser}
              {browserVersion ? ` ${browserVersion}` : ""} on {os}
            </span>
            {statusBadge}
          </div>
          <p className="mt-0.5 text-foreground/70 text-xs">
            Created{" "}
            {formatDistanceToNow(session.createdAt, { addSuffix: true })}
            <IconPointFilled className="mx-1 inline size-1.5" />
            Expires {formatDistanceToNow(session.expiresAt)}
          </p>
        </div>
      </AccordionTrigger>

      <AccordionContent
        className="border-t px-4 pt-3 pb-4"
        id={`session-details-${session.token}`}
      >
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow
            icon={<IconGlobe className="size-3.5" />}
            label="IP Address"
            value={
              session.ipAddress === "0000:0000:0000:0000:0000:0000:0000:0000"
                ? "Localhost / Internal"
                : session.ipAddress || "Unknown"
            }
          />
          <DetailRow
            icon={<IconShield className="size-3.5" />}
            label="User Agent"
            truncate
            value={session.userAgent || "Unknown device"}
          />
          <DetailRow
            icon={<IconCalendar className="size-3.5" />}
            label="Created"
            value={formatDistanceToNow(session.createdAt, {
              addSuffix: true,
            })}
          />
          <DetailRow
            icon={<IconRefresh className="size-3.5" />}
            label="Last Updated"
            value={formatDistanceToNow(session.updatedAt, {
              addSuffix: true,
            })}
          />
          <DetailRow
            highlight={expiringSoon ? "warn" : undefined}
            icon={<IconClock className="size-3.5" />}
            label="Expires"
            value={formatDistanceToNow(session.expiresAt, {
              addSuffix: true,
            })}
          />
        </dl>

        <div
          className={cn(
            "mt-4 rounded-md px-3 pt-2 pb-4",
            isCurrentSession
              ? "bg-green-600/10 dark:bg-green-400/10"
              : "bg-muted-foreground/10",
          )}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium text-foreground/70 text-xs">
              Session Token
            </span>
            <Button
              aria-label="Copy session token"
              onClick={handleCopyToken}
              variant="ghost"
            >
              {copied ? <IconCheck /> : <IconCopy />}
            </Button>
          </div>
          <code className="block break-all font-mono text-foreground/80 text-xs">
            {session.token}
          </code>
        </div>

        {!isCurrentSession && (
          <div className="mt-4 flex justify-end">
            <Button
              aria-label={`Revoke session for ${browser} on ${os}`}
              className="gap-1.5"
              disabled={revokeSession.isPending || isCurrentSession}
              onClick={() => {
                revokeSession.mutate({
                  token: session.token,
                })
              }}
              size="sm"
              variant="destructive"
            >
              {revokeSession.isPending ? <Spinner /> : <IconTrash />}
              Revoke session
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
  truncate?: boolean
  highlight?: "warn" | "error"
}

function DetailRow({
  icon,
  label,
  value,
  truncate,
  highlight,
}: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="flex items-center gap-1 font-medium text-foreground/70 text-xs">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          "text-foreground text-xs",
          truncate && "truncate",
          highlight === "warn" && "text-amber-600 dark:text-amber-400",
          highlight === "error" && "text-destructive",
        )}
        title={truncate ? value : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
