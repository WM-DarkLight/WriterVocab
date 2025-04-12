import type React from "react"
import type { Metadata } from "next"
import { Inter, Merriweather } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { DatabaseProvider } from "@/components/database-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "WriterVocab",
  description: "Expand your vocabulary for creative writing and storytelling",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DatabaseProvider>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </DatabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'