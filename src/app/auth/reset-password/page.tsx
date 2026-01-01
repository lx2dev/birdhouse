import { IconAlertTriangle } from "@tabler/icons-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth/utils"
import { ResetPasswordView } from "@/modules/auth/views/reset-password"

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/auth/reset-password">) {
  const session = await getSession()
  if (session) return redirect("/dashboard")

  const { token } = await searchParams

  if (!token || typeof token !== "string") {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <AlertTitle className="font-semibold">Invalid Request</AlertTitle>
          <AlertDescription>
            The password reset link is invalid or has expired. Please request a
            new one.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Link href="/auth/signin">
            <Button variant="outline">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return <ResetPasswordView token={token} />
}
