import { IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button render={<Link href="/dashboard" />} variant="link">
        Go to Dashboard <IconArrowRight />
      </Button>
    </div>
  )
}
