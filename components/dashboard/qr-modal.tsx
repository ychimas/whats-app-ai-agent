"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

import { useWAI } from "@/lib/wai-context"
import { useToast } from "@/components/ui/use-toast"

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanned: () => void
}

export function QRModal({ open, onOpenChange, onScanned }: QRModalProps) {
  const { currentAgent } = useWAI()
  const { toast } = useToast()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    setLoading(true)
    setQrCode(null) // Reset QR code on open

    // Initial fetch to trigger connection
    fetch(`/api/whatsapp/status?agentId=${currentAgent}`).catch(console.error)

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/whatsapp/status?agentId=${currentAgent}`)
        const data = await res.json()
        
        if (data.qrCode) {
            setQrCode(data.qrCode)
            setLoading(false)
        }
        
        if (data.isConnected) {
            toast({
              title: "WhatsApp Conectado",
              description: `Agente ${currentAgent} vinculado exitosamente.`,
              className: "bg-green-50 border-green-200 text-green-900",
            })
            onScanned()
        }
      } catch (e) {
        console.error(e)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [open, onScanned, currentAgent, toast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold text-foreground">Conectar WhatsApp</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary/30 rounded-xl p-6 flex flex-col items-center">
            {loading && !qrCode ? (
                <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Generando QR...</span>
                </div>
            ) : qrCode ? (
                <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-inner relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="QR Code" className="w-full h-full" />
                </div>
            ) : (
                <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                    Esperando QR...
                </div>
            )}

            <p className="text-sm text-muted-foreground mt-4 text-center">
              Escanea el codigo QR desde la aplicacion de WhatsApp en tu telefono
            </p>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Abre WhatsApp en tu telefono {">"} Menu {">"} Dispositivos vinculados {">"} Vincular dispositivo
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
