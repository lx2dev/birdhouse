"use client"

import { IconRefresh } from "@tabler/icons-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function VersionChecker() {
  const [initialVersion, setInitialVersion] = React.useState<{
    buildId: string
    commit: string
    repoUrl: string
  } | null>(null)

  React.useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        })
        if (!res.ok) return null
        return await res.json()
      } catch (error) {
        console.error("Failed to check version", error)
        return null
      }
    }

    if (!initialVersion) {
      fetchVersion().then((data) => {
        if (data) setInitialVersion(data)
      })
      return
    }

    const interval = setInterval(async () => {
      const currentVersion = await fetchVersion()
      if (currentVersion && currentVersion.buildId !== initialVersion.buildId) {
        toast.custom(
          () => (
            <div className="flex w-full items-center gap-4 rounded-lg border bg-background p-4 shadow-lg">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <IconRefresh className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Update available</h3>
                <p className="text-muted-foreground text-sm">
                  A new version has been deployed.{" "}
                  {currentVersion.repoUrl && (
                    <a
                      className="font-medium underline underline-offset-4 hover:text-primary"
                      href={`${currentVersion.repoUrl}/compare/${initialVersion.commit}...${currentVersion.commit}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View changes
                    </a>
                  )}
                </p>
              </div>
              <Button onClick={() => window.location.reload()} size="sm">
                Refresh
              </Button>
            </div>
          ),
          {
            duration: Infinity,
            id: "version-update-toast",
          },
        )
        clearInterval(interval)
      }
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [initialVersion])

  return null
}
