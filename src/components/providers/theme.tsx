"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"

export function ThemeProvider({ children }: React.PropsWithChildren) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
