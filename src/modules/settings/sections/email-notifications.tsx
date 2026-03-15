"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconDeviceFloppy, IconInfoCircle } from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import type { RouterOutputs } from "@/lib/api/client"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { NOTIFICATION_ITEMS } from "@/modules/settings/lib/notification-items"
import { userPreferencesSchema } from "@/schemas/user-preferences"

export function EmailNotificationsSection() {
  return (
    <Suspense fallback={<EmailNotificationsSection.Skeleton />}>
      <ErrorBoundary fallback={<EmailNotificationsSection.Error />}>
        <EmailNotificationsSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function EmailNotificationsSuspense() {
  const [preferences] = api.userPreferences.getAll.useSuspenseQuery()

  const enabledCount = Object.values(preferences.notifications).filter(
    Boolean,
  ).length
  const totalCount = Object.keys(preferences.notifications).length

  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">
          Email Notifications
        </h2>
      </div>

      <div className="@md:col-span-2 col-span-1">
        <div className="flex flex-col gap-4">
          <Badge
            className={cn(
              "ml-auto h-auto gap-1.5 px-2.5 py-1",
              enabledCount > 0
                ? "border-transparent bg-green-600/20 text-green-600 dark:bg-green-400/20 dark:text-green-400"
                : "bg-muted text-muted-foreground",
            )}
            variant="outline"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                enabledCount > 0
                  ? "bg-green-600 dark:bg-green-400"
                  : "bg-muted-foreground",
              )}
            />
            {enabledCount}/{totalCount} enabled
          </Badge>

          <EmailNotificationsForm preferences={preferences} />
        </div>
      </div>
    </div>
  )
}

interface EmailNotificationsFormProps {
  preferences: RouterOutputs["userPreferences"]["getAll"]
}

function EmailNotificationsForm({ preferences }: EmailNotificationsFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.input<typeof userPreferencesSchema>>({
    defaultValues: {
      notifications: preferences.notifications,
    },
    resolver: zodResolver(userPreferencesSchema),
  })

  const updatePreferences = api.userPreferences.update.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      void utils.userPreferences.getAll.invalidate()
      toast.success("Preferences updated")
    },
  })

  function onSubmit(values: z.input<typeof userPreferencesSchema>) {
    if (
      JSON.stringify(values.notifications) ===
      JSON.stringify(preferences.notifications)
    ) {
      toast("No changes to save", {
        description: "Your email notification preferences are up to date.",
      })
      return
    }

    updatePreferences.mutate(values)
  }

  const { isSubmitting } = form.formState
  const isLoading = updatePreferences.isPending || isSubmitting
  const hasChanges =
    JSON.stringify(form.watch("notifications")) !==
    JSON.stringify(preferences.notifications)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="p-0">
        <CardContent className="p-0">
          {NOTIFICATION_ITEMS.map((item) => {
            const Icon = item.icon
            const isEnabled = form.watch(`notifications.${item.id}`)

            return (
              <Controller
                control={form.control}
                key={item.id}
                name={`notifications.${item.id}`}
                render={({ field, fieldState }) => (
                  <Field
                    className={cn(
                      "flex items-start gap-4 p-5 transition-colors",
                      isEnabled ? "bg-muted/30" : "bg-card",
                    )}
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel
                      className="has-data-checked:bg-transparent!"
                      htmlFor={field.name}
                    >
                      <div className="flex w-full items-center gap-2">
                        <div
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
                            isEnabled
                              ? "bg-primary/10 text-chart-3"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm">
                              {item.label}
                            </span>

                            {item.badge && (
                              <Badge className="h-auto bg-primary/20 px-1.5 py-0.5 text-[10px] text-foreground/70 uppercase tracking-wide">
                                {item.badge}
                              </Badge>
                            )}
                          </div>

                          <FieldDescription className="leading-relaxed">
                            {item.description}
                          </FieldDescription>
                          <FieldDescription className="mt-1.5 text-muted-foreground/70 text-xs leading-relaxed">
                            {item.detail}
                          </FieldDescription>
                        </div>

                        <div className="mt-0.5 shrink-0">
                          <Switch
                            checked={isEnabled}
                            disabled={isLoading}
                            id={field.name}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                            }}
                          />
                        </div>
                      </div>
                    </FieldLabel>
                  </Field>
                )}
              />
            )
          })}
        </CardContent>
      </Card>

      <Alert className="mt-4 text-muted-foreground">
        <IconInfoCircle />
        <AlertTitle className="font-medium">
          Transactional emails such as password resets and billing receipts are
          always sent regardless of these settings.
        </AlertTitle>
      </Alert>

      <div className="mt-8 flex items-start justify-between">
        <p
          aria-live="polite"
          className={cn(
            "text-muted-foreground text-sm transition-opacity",
            hasChanges ? "opacity-100" : "opacity-0",
          )}
        >
          You have unsaved changes.
        </p>

        <Button
          aria-label="Save notification preference changes"
          className="ml-auto"
          disabled={!hasChanges || isLoading}
          type="submit"
        >
          {isLoading ? <Spinner /> : <IconDeviceFloppy />}
          Save changes
        </Button>
      </div>
    </form>
  )
}

EmailNotificationsSection.Skeleton = function EmailNotificationsSkeleton() {
  return <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
}

EmailNotificationsSection.Error = function EmailNotificationsError() {
  return (
    <div className="text-destructive">
      Failed to load email notifications settings.
    </div>
  )
}
