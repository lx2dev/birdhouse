"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconLoader2,
  IconLogin2,
  IconMail,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { authClient } from "@/lib/auth/client"
import { SignInSchema } from "@/modules/auth/schemas/auth"

export function SignInForm() {
  const router = useRouter()

  const [showPassword, setShowPassword] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof SignInSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(SignInSchema),
  })

  const isPending = form.formState.isSubmitting

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    await authClient.signIn.email({
      ...data,
      fetchOptions: {
        onError({ error }) {
          toast.error("Something went wrong:", {
            description: error.message,
          })
        },
        onSuccess() {
          form.reset()
          toast.success("Successfully signed in!")
          router.push("/dashboard")
        },
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Button type="button" variant="outline">
            <Icons.discord />
            Sign in with Discord
          </Button>
          <Button type="button" variant="outline">
            <Icons.github />
            Sign in with GitHub
          </Button>
        </Field>

        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>

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
              <div className="flex items-center">
                <FieldLabel htmlFor="password">
                  <IconKey className="size-4" /> Password
                </FieldLabel>
                <Link className="ml-auto" href="#" tabIndex={-1}>
                  <Button
                    className="h-auto p-0"
                    disabled={isPending}
                    // TODO: Implement forgot password flow
                    onClick={() => alert("Not implemented yet")}
                    size="xs"
                    tabIndex={-1}
                    variant="link"
                  >
                    Forgot your password?
                  </Button>
                </Link>
              </div>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                  id="password"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => setShowPassword(!showPassword)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
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
                Login
              </>
            )}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
