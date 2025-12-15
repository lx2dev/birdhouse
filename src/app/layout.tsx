import type { Metadata } from "next"
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/providers/theme"
import { Toaster } from "@/components/ui/sonner"
import { TRPCReactProvider } from "@/lib/api/client"
import { cn } from "@/lib/utils"

import "@/styles/globals.css"

const notoSans = Noto_Sans({
  variable: "--font-sans",
})

const notoMono = Noto_Sans_Mono({
  variable: "--font-mono",
})

export const metadata: Metadata = {
  description: "Birdhouse",
  icons: {
    icon: "/favicon.svg",
  },
  title: "A Proxmox Virtual Compute Provisioning Platform By Lx2.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", notoSans.variable, notoMono.variable)}>
        <TRPCReactProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
