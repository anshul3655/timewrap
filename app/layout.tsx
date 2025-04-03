import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TimeWrap - Commit Anywhere in Time",
  description:
    "Create and customize your GitHub contribution graph with TimeWrap. Design your own contribution pattern and export it as Git commands.",
  metadataBase: new URL("https://timewrap.ompreetham.com"),
  authors: [{ name: "Om Preetham Bandi", url: "https://ompreetham.com" }],
  creator: "Om Preetham Bandi",
  publisher: "Om Preetham Bandi",
  keywords: ["GitHub", "contribution graph", "git history", "time travel", "commit history", "developer tools"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://timewrap.ompreetham.com",
    title: "TimeWrap - Commit Anywhere in Time",
    description:
      "Create and customize your GitHub contribution graph with TimeWrap. Design your own contribution pattern and export it as Git commands.",
    siteName: "TimeWrap",
    images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "TimeWrap Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TimeWrap - Commit Anywhere in Time",
    description: "Create and customize your GitHub contribution graph with TimeWrap",
    images: ["/logo.jpg"],
    creator: "@ompreetham",
  },
  alternates: {
    canonical: "https://timewrap.ompreetham.com",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TimeWrap" />
        <link rel="canonical" href="https://timewrap.ompreetham.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'