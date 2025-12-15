"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconCpu,
  IconDatabase,
  IconPlus,
  IconPointFilled,
} from "@tabler/icons-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Controller, useForm } from "react-hook-form"
import type z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { createComputeSchema } from "@/modules/dashboard/schemas"
export function NewComputeSection() {
  return (
    <Suspense fallback={<NewComputeSection.Skeleton />}>
      <ErrorBoundary fallback={<NewComputeSection.Error />}>
        <NewComputeSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function NewComputeSectionSuspense() {
  const form = useForm({
    defaultValues: {
      name: "",
      templateId: "",
    },
    resolver: zodResolver(createComputeSchema),
  })

  const isSubmitting = form.formState.isSubmitting

  const [templates] = api.template.list.useSuspenseQuery()

  async function onSubmit(data: z.infer<typeof createComputeSchema>) {
    console.log(data)
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Instance Details</FieldLegend>
              <FieldDescription>Name your instance</FieldDescription>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Instance Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      id={field.name}
                      placeholder="web-server-01"
                    />
                    <FieldDescription>
                      Use only lowercase letters, numbers, and hyphens
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldSet>
            <FieldSeparator />
            <Controller
              control={form.control}
              name="templateId"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Choose Template</FieldLegend>
                  <FieldDescription>
                    Select compute resources for your instance
                  </FieldDescription>
                  {templates.length === 0 ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No templates available</EmptyTitle>
                      </EmptyHeader>
                      <EmptyContent>
                        <p className="text-center text-muted-foreground text-sm">
                          There are no instance templates available. Please
                          contact support for assistance.
                        </p>
                      </EmptyContent>
                    </Empty>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {templates.map((template) => (
                        <RadioGroup
                          aria-invalid={fieldState.invalid}
                          disabled={isSubmitting}
                          key={template.id}
                          name={field.name}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FieldLabel
                            className={cn(
                              "border-2 transition-colors",
                              field.value === template.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50",
                              isSubmitting && "cursor-not-allowed opacity-50",
                            )}
                            htmlFor={template.id}
                          >
                            <Field orientation="horizontal">
                              <FieldContent className="space-y-3">
                                <div>
                                  <FieldLabel>
                                    {template.displayName}
                                  </FieldLabel>
                                  {template.description && (
                                    <FieldDescription>
                                      {template.description}
                                    </FieldDescription>
                                  )}
                                </div>

                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <IconCpu className="size-4" />
                                    <span>
                                      {template.cpuCores}{" "}
                                      {template.cpuCores === 1
                                        ? "Core"
                                        : "Cores"}
                                    </span>
                                    <IconPointFilled className="size-2.5" />
                                    <span>
                                      {(template.memoryMb / 1024).toFixed(1)} GB
                                      RAM
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <IconDatabase className="size-4" />
                                    <span>{template.diskGb} GB Storage</span>
                                  </div>
                                </div>
                              </FieldContent>
                              <RadioGroupItem
                                disabled={isSubmitting}
                                id={template.id}
                                value={template.id}
                              />
                            </Field>
                          </FieldLabel>
                        </RadioGroup>
                      ))}
                    </div>
                  )}

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />

            <Field orientation="horizontal">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Creating...
                  </>
                ) : (
                  <>
                    <IconPlus />
                    Create Instance
                  </>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

NewComputeSection.Skeleton = function NewComputeSectionSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, idx) => (
              <Skeleton className="h-32" key={idx} />
            ))}
          </div>
          <Skeleton className="h-10 w-1/6" />
        </div>
      </CardContent>
    </Card>
  )
}

NewComputeSection.Error = function NewComputeSectionError() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Unable to Load Compute Instance Templates</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <p className="text-center text-muted-foreground text-sm">
          There was an error loading compute instance templates. Please try
          refreshing the page.
        </p>
      </EmptyContent>
    </Empty>
  )
}
