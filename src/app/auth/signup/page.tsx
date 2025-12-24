import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"
import { SignUpView } from "@/modules/auth/views/signup"

export default async function SignUpPage() {
  const session = await getSession()
  if (session) return redirect("/dashboard")

  return <SignUpView />
}
