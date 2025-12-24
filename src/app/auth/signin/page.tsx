import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"
import { SignInView } from "@/modules/auth/views/signin"

export default async function SignInPage() {
  const session = await getSession()
  if (session) return redirect("/dashboard")

  return <SignInView />
}
