import type { Metadata } from "next"
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google"

import "@/styles/globals.css"

import { cn } from "@/lib/utils"

const notoSans = Noto_Sans({
  variable: "--font-sans",
})

const notoMono = Noto_Sans_Mono({
  variable: "--font-mono",
})

export const metadata: Metadata = {
  description: "Birdhouse",
  title: "A Proxmox Virtual Compute Provisioning Platform By Lx2.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("antialiased", notoSans.variable, notoMono.variable)}>
        {children}
      </body>
    </html>
  )
}
