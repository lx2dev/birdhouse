import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResetPasswordForm } from "@/modules/auth/ui/reset-password-form"

export function ResetPasswordView({ token }: { token: string }) {
  return (
    <>
      <Link className="block text-center" href="/auth/signin">
        <Button variant="link">
          <IconArrowLeft /> Back to Sign In
        </Button>
      </Link>

      <Card className="mx-auto mt-4 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </>
  )
}
