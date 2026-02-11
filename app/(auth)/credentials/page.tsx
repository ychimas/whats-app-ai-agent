"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CredentialsDisplay } from "@/components/auth/credentials-display"
import { useAuth } from "@/lib/auth-context"

export default function CredentialsPage() {
    const router = useRouter()
    const { user, authStep, isLoading } = useAuth()

    useEffect(() => {
        if (isLoading) return
        if (!user) {
            router.replace("/login")
            return
        }
        if (authStep === "app") {
            router.replace("/dashboard")
        }
        if (authStep === "select-provider") {
            router.replace("/select-provider")
        }
    }, [authStep, isLoading, router, user])

    return <CredentialsDisplay />
}

