import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react"
import type React from "react"

export type Theme = "light" | "dark" | "system"

export type ThemeOptions = {
  value: Theme
  label: string
  description: string
  icon: React.ElementType
  preview: React.ReactNode
}

export const themeOptions: ThemeOptions[] = [
  {
    description: "Clean white background",
    icon: IconSun,
    label: "Light",
    preview: (
      <div className="size-full overflow-hidden rounded-lg border border-neutral-200 bg-white sm:rounded-xl">
        <div className="flex h-[18%] items-center gap-[3%] border-neutral-200 border-b bg-neutral-100 px-[4%]">
          <span className="h-[30%] w-[3%] rounded-full bg-neutral-300" />
          <span className="h-[30%] w-[3%] rounded-full bg-neutral-300" />
          <span className="ml-[2%] h-[30%] flex-1 rounded-full bg-neutral-300" />
        </div>
        <div className="flex h-[82%] flex-col gap-[8%] p-[5%]">
          <div className="h-[10%] w-[78%] rounded-full bg-neutral-300" />
          <div className="h-[42%] rounded-[8%] border border-neutral-300/90 bg-neutral-100" />
          <div className="mt-auto grid h-[24%] grid-cols-2 gap-[4%]">
            <div className="rounded-[8%] border border-neutral-300/90 bg-neutral-100" />
            <div className="rounded-[8%] bg-neutral-300" />
          </div>
        </div>
      </div>
    ),
    value: "light",
  },
  {
    description: "Easy on the eyes at night",
    icon: IconMoon,
    label: "Dark",
    preview: (
      <div className="size-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 sm:rounded-xl">
        <div className="flex h-[18%] items-center gap-[3%] border-neutral-800 border-b bg-neutral-800 px-[4%]">
          <span className="h-[30%] w-[3%] rounded-full bg-neutral-600" />
          <span className="h-[30%] w-[3%] rounded-full bg-neutral-600" />
          <span className="ml-[2%] h-[30%] flex-1 rounded-full bg-neutral-700" />
        </div>
        <div className="flex h-[82%] flex-col gap-[8%] p-[5%]">
          <div className="h-[10%] w-[78%] rounded-full bg-neutral-600" />
          <div className="h-[42%] rounded-[8%] border border-neutral-700/80 bg-neutral-800" />
          <div className="mt-auto grid h-[24%] grid-cols-2 gap-[4%]">
            <div className="rounded-[8%] border border-neutral-700/80 bg-neutral-800" />
            <div className="rounded-[8%] bg-neutral-700" />
          </div>
        </div>
      </div>
    ),
    value: "dark",
  },
  {
    description: "Follows your OS setting",
    icon: IconDeviceDesktop,
    label: "System",
    preview: (
      <div className="flex size-full overflow-hidden rounded-lg border border-neutral-200 sm:rounded-xl">
        <div className="w-1/2 border-neutral-200 border-r bg-white">
          <div className="h-[18%] border-neutral-200 border-b bg-neutral-100" />
          <div className="flex h-[82%] flex-col gap-[10%] p-[6%]">
            <div className="h-[10%] w-[86%] rounded-full bg-neutral-300" />
            <div className="h-[32%] rounded-[8%] border border-neutral-300/90 bg-neutral-100" />
            <div className="mt-auto h-[18%] rounded-[8%] border border-neutral-300/90 bg-neutral-100" />
          </div>
        </div>
        <div className="w-1/2 bg-neutral-900">
          <div className="h-[18%] border-neutral-800 border-b bg-neutral-800" />
          <div className="flex h-[82%] flex-col gap-[10%] p-[6%]">
            <div className="h-[10%] w-[86%] rounded-full bg-neutral-600" />
            <div className="h-[32%] rounded-[8%] border border-neutral-700/80 bg-neutral-800" />
            <div className="mt-auto h-[18%] rounded-[8%] border border-neutral-700/80 bg-neutral-800" />
          </div>
        </div>
      </div>
    ),
    value: "system",
  },
]
