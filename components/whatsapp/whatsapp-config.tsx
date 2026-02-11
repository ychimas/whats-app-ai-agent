"use client"

import { useState } from "react"
import { useWAI } from "@/lib/wai-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LicenseBanner } from "@/components/license-banner"
import { MessageCircle, Key, Phone, Building, Shield, CheckCircle, Copy, ExternalLink, Info } from "lucide-react"

export function WhatsAppConfig() {
  const { whatsappConfig, setWhatsappConfig, setWhatsappStatus } = useWAI()
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : ""
  const defaultVerifyToken = "laik_verify_token_2024"

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTestConnection = async () => {
    setWhatsappStatus("connecting")

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whatsappConfig),
      })

      if (response.ok) {
        setWhatsappStatus("connected")
      } else {
        setWhatsappStatus("disconnected")
      }
    } catch {
      setWhatsappStatus("disconnected")
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <LicenseBanner />

      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Configurar WhatsApp Cloud API</h1>
        <p className="text-muted-foreground mt-2">Conecta tu cuenta de WhatsApp Business para automatizar mensajes</p>
      </div>

      {/* Setup Instructions */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Pasos para configurar
        </h2>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <span>
              Crea una cuenta en{" "}
              <a
                href="https://developers.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Meta for Developers <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <span>Crea una nueva aplicacion y selecciona WhatsApp como producto</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <span>Obtén tu Access Token y Phone Number ID desde el panel de WhatsApp</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            <span>Configura el webhook con la URL y token proporcionados abajo</span>
          </li>
        </ol>
      </div>

      {/* Webhook URL & Verify Token */}
      <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Configuracion del Webhook
        </h2>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Copia estos valores y pégalos en la configuracion del webhook de tu aplicacion en Meta Developers
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">URL del Webhook</Label>
          <div className="flex gap-2">
            <Input value={webhookUrl} readOnly className="bg-secondary/50 font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(webhookUrl, "webhook")}
              className="shrink-0"
            >
              {copied === "webhook" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Token de Verificacion</Label>
          <div className="flex gap-2">
            <Input value={defaultVerifyToken} readOnly className="bg-secondary/50 font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(defaultVerifyToken, "token")}
              className="shrink-0"
            >
              {copied === "token" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Usa este token exacto en el campo "Verify Token" de Meta Developers
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Credenciales de WhatsApp Cloud API
        </h2>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumberId" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Phone Number ID
            </Label>
            <Input
              id="phoneNumberId"
              placeholder="Ej: 106540352242922"
              value={whatsappConfig.phoneNumberId}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })}
              className="bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAccountId" className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              WhatsApp Business Account ID
            </Label>
            <Input
              id="businessAccountId"
              placeholder="Ej: 102290129340398"
              value={whatsappConfig.businessAccountId}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })}
              className="bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken" className="flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              Access Token
            </Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Tu access token de WhatsApp Cloud API"
              value={whatsappConfig.accessToken}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })}
              className="bg-secondary/30"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Guardado
              </>
            ) : (
              "Guardar Configuracion"
            )}
          </Button>
          <Button variant="outline" onClick={handleTestConnection}>
            Probar Conexion
          </Button>
        </div>
      </div>
    </div>
  )
}
