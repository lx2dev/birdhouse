"use client"

import { IconDeviceFloppy } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import type { Theme } from "@/modules/settings/lib/theme-options"
import { themeOptions } from "@/modules/settings/lib/theme-options"

export function AppearanceSection() {
  return (
    <Suspense fallback={<AppearanceSection.Skeleton />}>
      <ErrorBoundary fallback={<AppearanceSection.Error />}>
        <AppearanceSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function AppearanceSectionSuspense() {
  const utils = api.useUtils()
  const { theme, setTheme } = useTheme()

  const [preferences] = api.userPreferences.getAll.useSuspenseQuery()
  const prefTheme = preferences.theme

  const [savedTheme, setSavedTheme] = React.useState<Theme>(prefTheme)
  const [selectedTheme, setSelectedTheme] = React.useState<Theme>(prefTheme)

  const isTheme = React.useCallback(
    (value: string | undefined): value is Theme =>
      value === "light" || value === "dark" || value === "system",
    [],
  )

  React.useEffect(() => {
    if (!isTheme(theme)) return

    setSelectedTheme(theme)
  }, [theme, isTheme])

  React.useEffect(() => {
    setSavedTheme(prefTheme)
  }, [prefTheme])

  const hasChanges = selectedTheme !== savedTheme

  const updatePreferences = api.userPreferences.update.useMutation({
    onError(error) {
      utils.userPreferences.getAll.setData(undefined, (prev) => prev)
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess({ preferences }) {
      utils.userPreferences.getAll.invalidate()
      setSavedTheme(preferences.theme)
      setTheme(preferences.theme)
      toast.success("Preferences saved", {
        description: `Theme set to ${preferences.theme}`,
      })
    },
  })

  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">Appearance</h2>
      </div>

      <div className="@md:col-span-2 col-span-1 space-y-8">
        <div>
          <RadioGroup
            className="grid @md:grid-cols-3 grid-cols-1 @md:gap-4 gap-3"
            onValueChange={(v) => setSelectedTheme(v as Theme)}
            value={selectedTheme}
          >
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedTheme === option.value

              return (
                <FieldLabel
                  className={cn(
                    "relative",
                    isSelected
                      ? "border-primary shadow-sm"
                      : "border-border hover:border-muted-foreground/40",
                  )}
                  htmlFor={option.value}
                  key={option.value}
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <div className="mb-3 aspect-video w-full overflow-hidden @md:rounded-xl rounded-lg">
                        {option.preview}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon aria-hidden="true" className="size-3.5" />
                          <FieldTitle>{option.label}</FieldTitle>
                        </div>
                        <RadioGroupItem
                          aria-label={`${option.label} — ${option.description}`}
                          id={option.value}
                          onChange={() => setSelectedTheme(option.value)}
                          value={option.value}
                        />
                      </div>
                      <FieldDescription className="hidden max-w-[24ch] leading-tight lg:block lg:text-xs xl:text-sm">
                        {option.description}
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              )
            })}
          </RadioGroup>

          <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
            {selectedTheme === "system"
              ? "The interface will automatically match your operating system appearance."
              : selectedTheme === "dark"
                ? "A darker color scheme that reduces eye strain in low-light environments."
                : "A clean, bright theme best suited for well-lit workspaces."}
          </p>
        </div>

        <div className="flex items-center justify-between">
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
            aria-label="Save preference changes"
            className="ml-auto"
            disabled={!hasChanges || updatePreferences.isPending}
            onClick={() => updatePreferences.mutate({ theme: selectedTheme })}
          >
            {updatePreferences.isPending ? <Spinner /> : <IconDeviceFloppy />}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}

AppearanceSection.Skeleton = function AppearanceSectionSkeleton() {
  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">Appearance</h2>
      </div>

      <div className="@md:col-span-2 col-span-1 space-y-8">
        <div>
          <div className="grid @md:grid-cols-3 grid-cols-1 @md:gap-4 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="rounded-lg border border-border" key={i}>
                <div className="px-2 pt-2">
                  <Skeleton className="aspect-video w-full" />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Skeleton className="size-3" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton className="mt-3 h-3 w-full max-w-[40ch]" />
        </div>

        <div className="flex items-center justify-between">
          <Button className="ml-auto" disabled>
            <Spinner />
            Saving changes
          </Button>
        </div>
      </div>
    </div>
  )
}

AppearanceSection.Error = function AppearanceSectionError() {
  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <p className="text-destructive">
          Failed to load appearance settings. Please try again later.
        </p>
      </div>
    </div>
  )
}
