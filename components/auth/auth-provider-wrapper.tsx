"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { WAIProvider } from "@/lib/wai-context"

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <WAIProvider>{children}</WAIProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
