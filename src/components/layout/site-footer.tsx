import { IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="fixed bottom-4 left-4 hidden text-muted-foreground text-xs lg:block">
      by{" "}
      <Link
        className="inline-flex items-center gap-0.5 font-medium underline-offset-4 hover:underline"
        href="https://hub.lx2.dev"
        rel="noopener noreferrer"
        target="_blank"
      >
        Lx2.dev <IconArrowUpRight className="size-3" />
      </Link>
    </footer>
  )
}
