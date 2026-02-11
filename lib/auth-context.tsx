"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthStep } from "./types"
import { useSession, signOut } from "next-auth/react"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  authStep: AuthStep
  setAuthStep: (step: AuthStep) => void
  isAuthenticated: boolean
  login: (email: string, licenseKey: string) => boolean
  register: (email: string) => User
  logout: () => void
  selectProvider: (provider: "openai" | "gemini" | "groq", apiKey: string) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Generate random license key
function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [authStep, setAuthStep] = useState<AuthStep>("login")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
      return
    }

    if (status === "authenticated" && session?.user?.email) {
      // Create user from session if not exists
      if (!user) {
        const newUser: User = {
          id: session.user.email, // Use email as ID for simplicity
          email: session.user.email,
          licenseKey: generateLicenseKey(), // Auto-generate license for Google users for now
          planExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
          image: session.user.image || undefined,
          name: session.user.name || undefined
        }
        setUser(newUser)
        // Ensure we are in the app state if logged in
        setAuthStep("app")
      }
    } else if (status === "unauthenticated") {
      // If not authenticated via NextAuth, check if we have local user state
      // If not, reset to login
      if (!user) {
        setAuthStep("login")
      }
    }
    setIsLoading(false)
  }, [status, session, user])

  const isAuthenticated = user !== null && authStep === "app"

  const login = (email: string, licenseKey: string): boolean => {
    // Simulate login validation (Legacy/Manual)
    if (email && licenseKey && licenseKey.length >= 10) {
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        licenseKey,
        planExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      }
      setUser(newUser)
      setAuthStep("select-provider")
      return true
    }
    return false
  }

  const register = (email: string): User => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      licenseKey: generateLicenseKey(),
      planExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    }
    setUser(newUser)
    setAuthStep("credentials")
    return newUser
  }

  const logout = () => {
    signOut({ callbackUrl: "/login" })
    setUser(null)
    setAuthStep("login")
  }

  const selectProvider = (provider: "openai" | "gemini" | "groq", apiKey: string) => {
    if (user) {
      setUser({
        ...user,
        selectedProvider: provider,
        providerApiKey: apiKey,
      })
      setAuthStep("app")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authStep,
        setAuthStep,
        isAuthenticated,
        login,
        register,
        logout,
        selectProvider,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
