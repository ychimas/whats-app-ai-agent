import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Laik - Agente IA WhatsApp",
  description: "Automatización Inteligente para tu Comunicación en WhatsApp",
  generator: 'v0.app'
}

import { AuthProviderWrapper } from "@/components/auth/auth-provider-wrapper"
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProviderWrapper>
            {children}
          </AuthProviderWrapper>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
