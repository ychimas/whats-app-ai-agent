"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProviderSelection } from "@/components/auth/provider-selection"
import { useAuth } from "@/lib/auth-context"
import { VideoLoader } from "@/components/ui/video-loader"

export default function SelectProviderPage() {
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
    }, [authStep, isLoading, router, user])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <VideoLoader />
            </div>
        )
    }

    return <ProviderSelection />
}

