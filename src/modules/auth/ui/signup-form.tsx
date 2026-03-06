"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconLogin2,
  IconMail,
  IconUser,
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
import { authClient } from "@/lib/auth/client"
import { SignUpSchema } from "@/modules/auth/schemas/auth"

type LoadingState = Record<TrustedSocialProvider, boolean> & {
  email: boolean
  resetPassword: boolean
}

export function SignUpForm() {
  const router = useRouter()

  const providerLoadingState = Object.fromEntries(
    TRUSTED_SOCIAL_PROVIDERS.map((provider) => [provider, false]),
  ) as Record<TrustedSocialProvider, boolean>

  const [isLoading, setIsLoading] = React.useState<LoadingState>({
    ...providerLoadingState,
    email: false,
    resetPassword: false,
  })
  const [showPassword, setShowPassword] = React.useState<{
    password: boolean
    passwordConfirmation: boolean
  }>({
    password: false,
    passwordConfirmation: false,
  })

  const form = useForm<z.infer<typeof SignUpSchema>>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      passwordConfirmation: "",
    },
    resolver: zodResolver(SignUpSchema),
  })

  const isPending = Object.values(isLoading).some(Boolean)

  async function onSubmit(data: z.infer<typeof SignUpSchema>) {
    setIsLoading((prev) => ({
      ...prev,
      email: true,
    }))

    try {
      await authClient.signUp.email({
        ...data,
        fetchOptions: {
          onError({ error }) {
            console.error(error.message)
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
        description: (error as Error).message,
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
                placeholder="jburg@example.com"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">
                  <IconKey className="size-4" /> Password
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    id="password"
                    placeholder="********"
                    type={showPassword.password ? "text" : "password"}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={() => {
                        setShowPassword({
                          ...showPassword,
                          password: !showPassword.password,
                        })
                      }}
                      size="icon-xs"
                      tabIndex={-1}
                      variant="ghost"
                    >
                      {showPassword.password ? <IconEyeOff /> : <IconEye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="passwordConfirmation"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="passwordConfirmation">
                  <IconKey className="size-4" /> Confirm Password
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    id="passwordConfirmation"
                    placeholder="********"
                    type={
                      showPassword.passwordConfirmation ? "text" : "password"
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      disabled={isPending}
                      onClick={() => {
                        setShowPassword({
                          ...showPassword,
                          passwordConfirmation:
                            !showPassword.passwordConfirmation,
                        })
                      }}
                      size="icon-xs"
                      tabIndex={-1}
                      variant="ghost"
                    >
                      {showPassword.passwordConfirmation ? (
                        <IconEyeOff />
                      ) : (
                        <IconEye />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Field>
          <Button
            className="relative bg-foreground text-background hover:bg-foreground/80"
            disabled={isPending}
            type="submit"
          >
            {isLoading.email ? <Spinner /> : <IconLogin2 />}
            Sign Up
            {lastMethod === "email" && <LastUsedBadge />}
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/auth/signin">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
