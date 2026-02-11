"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
    const router = useRouter()
    const { user, authStep, isLoading } = useAuth()

    useEffect(() => {
        if (isLoading) return
        if (user && authStep === "app") {
            router.replace("/dashboard")
        }
        if (user && authStep === "select-provider") {
            router.replace("/select-provider")
        }
    }, [authStep, isLoading, router, user])

    return <RegisterForm />
}

