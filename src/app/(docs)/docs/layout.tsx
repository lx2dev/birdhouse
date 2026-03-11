import { DocsLayout as FumadocsLayout } from "fumadocs-ui/layouts/notebook"
import Link from "next/link"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { baseOptions } from "@/lib/layout.shared"
import { source } from "@/lib/source"
import { cn } from "@/lib/utils"

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <FumadocsLayout
      {...baseOptions()}
      sidebar={{
        footer: (
          <Link
            className={cn(
              "ml-2 hover:bg-card dark:hover:bg-black/35!",
              buttonVariants({
                size: "icon",
                variant: "ghost",
              }),
            )}
            href="/dashboard"
            target="_blank"
          >
            <Icons.logo className="size-7" />
          </Link>
        ),
      }}
      tree={source.getPageTree()}
    >
      {children}
    </FumadocsLayout>
  )
}
