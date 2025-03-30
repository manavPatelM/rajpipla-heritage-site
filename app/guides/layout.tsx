import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Palace Guides of India",
  description: "Discover the rich history and culture of Indian palaces with our expert guides",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div lang="en" suppressHydrationWarning>
      <div className={inter.className}>
          {children}
      </div>
    </div>
  )
}