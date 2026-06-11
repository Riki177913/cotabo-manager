import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import PWAInstallPrompt from "@/app/components/PWAInstallPrompt"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "COTABO Manager",
  description: "Sistema di gestione strumenti taxi per la Cooperativa COTABO",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "COTABO Manager",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192" },
      { url: "/icon-512x512.png", sizes: "512x512" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
