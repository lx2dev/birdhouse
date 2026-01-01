"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconEye,
  IconEyeOff,
  IconKey,
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
import { Spinner } from "@/components/ui/spinner"
import { env } from "@/env"
import { authClient } from "@/lib/auth/client"
import { SignInSchema } from "@/modules/auth/schemas/auth"

export function SignInForm() {
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState<{
    discord: boolean
    github: boolean
    resetPassword: boolean
  }>({
    discord: false,
    github: false,
    resetPassword: false,
  })
  const [showPassword, setShowPassword] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof SignInSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(SignInSchema),
  })

  const { isSubmitting } = form.formState
  const isPending =
    isLoading.discord || isLoading.github || isLoading.resetPassword

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    try {
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
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong:", {
        description: "See console for details.",
      })
    }
  }

  async function handleOAuth(provider: "discord" | "github") {
    try {
      setIsLoading((prev) => ({
        ...prev,
        [provider]: true,
      }))
      await authClient.signIn.social({
        callbackURL: "/dashboard",
        fetchOptions: {
          onError({ error }) {
            console.error(error.message)
            toast.error("Something went wrong:", {
              description: error.message,
            })
          },
        },
        provider,
      })
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong:", {
        description: "See console for details.",
      })
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        [provider]: false,
      }))
    }
  }

  async function handleForgotPassword() {
    if (!form.getValues("email")) {
      form.setError("email", {
        message: "Email is required to reset password.",
      })
      form.setFocus("email")
      return
    }

    setIsLoading((prev) => ({
      ...prev,
      resetPassword: true,
    }))

    await authClient.requestPasswordReset({
      email: form.getValues("email"),
      fetchOptions: {
        onError({ error }) {
          toast.error("Something went wrong:", {
            description: error.message,
          })
          setIsLoading((prev) => ({
            ...prev,
            resetPassword: false,
          }))
        },
        onSuccess() {
          toast.success("Password reset email sent!")
          form.reset()
          setIsLoading((prev) => ({
            ...prev,
            resetPassword: false,
          }))
        },
      },
      redirectTo: `${env.NEXT_PUBLIC_URL}/auth/reset-password`,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Button
            disabled={isPending || isSubmitting}
            onClick={() => handleOAuth("discord")}
            type="button"
            variant="outline"
          >
            {isLoading.discord ? <Spinner /> : <Icons.discord />}
            Sign in with Discord
          </Button>
          <Button
            disabled={isPending || isSubmitting}
            onClick={() => handleOAuth("github")}
            type="button"
            variant="outline"
          >
            {isLoading.github ? <Spinner /> : <Icons.github />}
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
                disabled={isPending || isSubmitting}
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
                <Button
                  className="ml-auto h-auto p-0"
                  disabled={isPending || isSubmitting}
                  onClick={handleForgotPassword}
                  size="xs"
                  tabIndex={-1}
                  variant="link"
                >
                  {isLoading.resetPassword ? <Spinner /> : null}
                  Forgot your password?
                </Button>
              </div>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending || isSubmitting}
                  id="password"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    disabled={isPending || isSubmitting}
                    onClick={() => setShowPassword(!showPassword)}
                    size="icon-xs"
                    tabIndex={-1}
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
          <Button disabled={isPending || isSubmitting} type="submit">
            {isSubmitting ? <Spinner /> : <IconLogin2 />}
            Login
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
