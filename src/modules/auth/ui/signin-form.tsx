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

import { getIconForProvider } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
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
import type { TrustedSocialProvider } from "@/constants"
import { TRUSTED_SOCIAL_PROVIDERS } from "@/constants"
import { env } from "@/env"
import { authClient } from "@/lib/auth/client"
import { SignInSchema } from "@/modules/auth/schemas/auth"

type LoadingState = Record<TrustedSocialProvider, boolean> & {
  email: boolean
  resetPassword: boolean
}

export function SignInForm() {
  const router = useRouter()

  const providerLoadingState = Object.fromEntries(
    TRUSTED_SOCIAL_PROVIDERS.map((provider) => [provider, false]),
  ) as Record<TrustedSocialProvider, boolean>

  const [isLoading, setIsLoading] = React.useState<LoadingState>({
    ...providerLoadingState,
    email: false,
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

  const isPending = Object.values(isLoading).some(Boolean)

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    try {
      setIsLoading((prev) => ({
        ...prev,
        email: true,
      }))

      await authClient.signIn.email({
        ...data,
        fetchOptions: {
          onError({ error }) {
            toast.error("Something went wrong:", {
              description: error.message,
            })
            setIsLoading((prev) => ({
              ...prev,
              email: false,
            }))
          },
          onSuccess() {
            form.reset()
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

  async function handleOAuth(provider: TrustedSocialProvider) {
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
            setIsLoading((prev) => ({
              ...prev,
              [provider]: false,
            }))
          },
        },
        provider,
      })
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong:", {
        description: (error as Error).message || "See console for details.",
      })
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

  const lastMethod = authClient.getLastUsedLoginMethod()

  const LastUsedBadge = () => (
    <Badge className="absolute -top-2 -right-2 ml-2 h-4 px-1 text-xs">
      Last used
    </Badge>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field className={`grid grid-cols-${TRUSTED_SOCIAL_PROVIDERS.length}`}>
          {Object.entries(TRUSTED_SOCIAL_PROVIDERS).map(([_, provider]) => (
            <Button
              className="relative"
              disabled={isPending}
              key={provider}
              onClick={() => handleOAuth(provider)}
              type="button"
              variant="outline"
            >
              {isLoading[provider] ? <Spinner /> : getIconForProvider(provider)}
              {lastMethod === provider && <LastUsedBadge />}
            </Button>
          ))}
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
                <Button
                  className="ml-auto h-auto p-0"
                  disabled={isPending}
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
                  disabled={isPending}
                  id="password"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    disabled={isPending}
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
          <Button
            className="relative bg-foreground text-background hover:bg-foreground/80"
            disabled={isPending}
            type="submit"
            variant="secondary"
          >
            {isLoading.email ? <Spinner /> : <IconLogin2 />}
            Login
            {lastMethod === "email" && <LastUsedBadge />}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
