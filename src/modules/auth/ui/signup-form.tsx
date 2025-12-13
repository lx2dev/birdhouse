"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconKey,
  IconLoader2,
  IconLogin2,
  IconMail,
  IconUser,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/client"
import { SignUpSchema } from "@/modules/auth/schemas/auth"

export function SignUpForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof SignUpSchema>>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(SignUpSchema),
  })

  const isPending = form.formState.isSubmitting

  async function onSubmit(data: z.infer<typeof SignUpSchema>) {
    await authClient.signUp.email({
      ...data,
      fetchOptions: {
        onError({ error }) {
          console.error(error.message)
          toast.error("Something went wrong:", {
            description: "Please check the console for more information.",
          })
        },
        onSuccess() {
          form.reset()
          toast.success("Account created successfully!")
          router.push("/dashboard")
        },
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Button disabled={isPending} type="button" variant="outline">
            <Icons.discord />
            Sign in with Discord
          </Button>
          <Button disabled={isPending} type="button" variant="outline">
            <Icons.github />
            Sign in with GitHub
          </Button>
        </Field>

        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="username">
                <IconUser className="size-4" /> Username
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id="username"
                placeholder="Jarls Burg"
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">
                <IconMail className="size-4" /> Email
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id="email"
                placeholder="you@example.com"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">
                <IconKey className="size-4" /> Password
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id="password"
                placeholder="********"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <>
                <IconLogin2 />
                Sign Up
              </>
            )}
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/auth/signin">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
