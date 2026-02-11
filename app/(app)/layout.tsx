"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { AgentSelector } from "@/components/agent-selector"
import { WhatsAppStatus } from "@/components/whatsapp-status"
import { Button } from "@/components/ui/button"
import { VideoLoader } from "@/components/ui/video-loader"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/auth-context"
import { useWAI } from "@/lib/wai-context"

function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, authStep, isLoading } = useAuth()
    const { setSidebarOpen } = useWAI()

    useEffect(() => {
        if (isLoading) return

        if (!user) {
            router.replace("/login")
            return
        }

        if (authStep === "select-provider") {
            router.replace("/select-provider")
            return
        }

        if (authStep !== "app") {
            router.replace("/login")
        }
    }, [authStep, isLoading, router, user])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <VideoLoader />
            </div>
        )
    }

    if (!user || authStep !== "app") {
        return null
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />

            <main className="flex-1 p-4 lg:p-6 overflow-y-auto lg:pr-24 relative">
                <div className="absolute top-4 right-4 z-10">
                    <ModeToggle />
                </div>

                <div className="lg:hidden mb-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="border-border hover:bg-secondary"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <div className="max-w-4xl mx-auto">{children}</div>
            </main>

            <WhatsAppStatus />
            <AgentSelector />
        </div>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>
}

