import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { APP_NAME, REPO_URL } from "@/constants"
import { cn } from "@/lib/utils"

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: REPO_URL,
    links: [
      {
        text: (
          <span
            className={cn(
              "hidden hover:bg-secondary! lg:flex",
              buttonVariants({
                size: "icon",
                variant: "ghost",
              }),
            )}
          >
            <Icons.logo className="size-7" />
          </span>
        ),
        url: "/dashboard",
      },
    ],
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <Icons.logo className="size-12 text-primary md:size-16" />
          <span className="inline font-semibold text-lg md:text-2xl">
            {APP_NAME}
          </span>
        </div>
      ),
      transparentMode: "top",
      url: "/docs",
    },
    themeSwitch: {
      mode: "light-dark",
    },
  }
}
