import { IconAlertTriangle, IconArrowLeft, IconHome } from "@tabler/icons-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { CopyButton } from "@/components/copy-button"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/lib/auth/utils"

type ErrorDetails = {
  alertTitle: string
  alertTone: "destructive" | "warning"
}

const errorDetailsByCode: Record<string, ErrorDetails> = {
  account_already_linked_to_different_user: {
    alertTitle: "This account is already linked",
    alertTone: "warning",
  },
  account_not_linked: {
    alertTitle: "No matching account was found",
    alertTone: "warning",
  },
  "email_doesn't_match": {
    alertTitle: "The email did not match",
    alertTone: "warning",
  },
  email_not_found: {
    alertTitle: "No account exists for that email",
    alertTone: "warning",
  },
  internal_server_error: {
    alertTitle: "Authentication service failure",
    alertTone: "destructive",
  },
  invalid_callback_request: {
    alertTitle: "The callback could not be verified",
    alertTone: "warning",
  },
  invalid_code: {
    alertTitle: "The code is no longer valid",
    alertTone: "warning",
  },
  no_callback_url: {
    alertTitle: "Callback URL is missing",
    alertTone: "destructive",
  },
  no_code: {
    alertTitle: "No authentication code was received",
    alertTone: "warning",
  },
  oauth_provider_not_found: {
    alertTitle: "That provider is not configured",
    alertTone: "warning",
  },
  signup_disabled: {
    alertTitle: "New sign-ups are disabled",
    alertTone: "warning",
  },
  state_invalid: {
    alertTitle: "The sign-in state is invalid",
    alertTone: "warning",
  },
  state_mismatch: {
    alertTitle: "The sign-in state did not match",
    alertTone: "warning",
  },
  state_not_found: {
    alertTitle: "The sign-in state was lost",
    alertTone: "warning",
  },
  unable_to_create_session: {
    alertTitle: "A session could not be created",
    alertTone: "destructive",
  },
  unable_to_create_user: {
    alertTitle: "A new account could not be created",
    alertTone: "destructive",
  },
  unable_to_get_user_info: {
    alertTitle: "Provider user info could not be loaded",
    alertTone: "warning",
  },
  unable_to_link_account: {
    alertTitle: "The account could not be linked",
    alertTone: "warning",
  },
}

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function getErrorDetails(errorCode: string | undefined) {
  if (errorCode && errorCode in errorDetailsByCode) {
    return errorDetailsByCode[errorCode]
  }

  return {
    alertTitle: "Authentication could not be completed",
    alertTone: "warning" as const,
  }
}

export default async function Page({ searchParams }: PageProps<"/auth/error">) {
  const session = await getSession()
  if (session) return redirect("/dashboard")

  const params = await searchParams
  const errorCode =
    firstValue(params.error) ?? firstValue(params.code) ?? undefined
  const details = getErrorDetails(errorCode)

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <Card className="overflow-hidden border-border/70 bg-card/95 py-0 shadow-2xl shadow-foreground/5">
        <CardHeader className="border-b bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
              <IconAlertTriangle className="size-6" />
            </div>
            <CardTitle className="font-semibold text-2xl text-destructive/85 uppercase tracking-[0.18em]">
              Error
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-6">
          <Alert variant={details.alertTone}>
            <IconAlertTriangle className="size-4" />
            <AlertTitle>{details.alertTitle}</AlertTitle>
          </Alert>

          <p className="flex items-center gap-1">
            <span className="text-muted-foreground uppercase">code:</span>{" "}
            <span className="font-mono">{errorCode}</span>
            <CopyButton
              payload={errorCode || ""}
              size="icon-sm"
              variant="ghost"
            />
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-10 w-full sm:flex-1"
              nativeButton={false}
              render={<Link href="/auth/signin" />}
              size="lg"
            >
              <IconArrowLeft />
              Back to sign in
            </Button>

            <Button
              className="h-10 w-full sm:flex-1"
              nativeButton={false}
              render={<Link href="/" />}
              size="lg"
              variant="outline"
            >
              <IconHome />
              Go home
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-muted-foreground text-xs">
            If this problem persists, please contact support with the error code
            above.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
