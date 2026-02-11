"use client"

import { useWAI } from "@/lib/wai-context"
import { cn } from "@/lib/utils"

export function WhatsAppStatus() {
  const { whatsappStatus } = useWAI()

  const statusConfig = {
    disconnected: {
      color: "bg-muted-foreground",
      text: "Desconectado",
      pulse: false,
    },
    connecting: {
      color: "bg-wai-warning",
      text: "Conectando...",
      pulse: true,
    },
    connected: {
      color: "bg-wai-success",
      text: "Conectado",
      pulse: false,
    },
  }

  const config = statusConfig[whatsappStatus]

  return (
    <div className="fixed bottom-4 right-4 bg-card rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2 z-30">
      <span className={cn("w-3 h-3 rounded-full", config.color, config.pulse && "animate-pulse")} />
      <span className="text-sm font-medium text-foreground">WhatsApp: {config.text}</span>
    </div>
  )
}
