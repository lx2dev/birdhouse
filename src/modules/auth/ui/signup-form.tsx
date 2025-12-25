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
import { authClient } from "@/lib/auth/client"
import { SignUpSchema } from "@/modules/auth/schemas/auth"

export function SignUpForm() {
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState<{
    discord: boolean
    github: boolean
  }>({
    discord: false,
    github: false,
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

  const { isSubmitting } = form.formState
  const isPending = isLoading.discord || isLoading.github

  async function onSubmit(data: z.infer<typeof SignUpSchema>) {
    try {
      await authClient.signUp.email({
        ...data,
        fetchOptions: {
          onError({ error }) {
            console.error(error.message)
            toast.error("Something went wrong:", {
              description: error.message,
            })
          },
          onSuccess() {
            form.reset()
            toast.success("Account created successfully!")
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
        description: (error as Error).message,
      })
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        [provider]: false,
      }))
    }
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
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="username">
                <IconUser className="size-4" /> Username
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending || isSubmitting}
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
                disabled={isPending || isSubmitting}
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
                    disabled={isPending || isSubmitting}
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
                    disabled={isPending || isSubmitting}
                    id="passwordConfirmation"
                    placeholder="********"
                    type={
                      showPassword.passwordConfirmation ? "text" : "password"
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      disabled={isPending || isSubmitting}
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
          <Button disabled={isPending || isSubmitting} type="submit">
            {isSubmitting ? <Spinner /> : <IconLogin2 />}
            Sign Up
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/auth/signin">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
