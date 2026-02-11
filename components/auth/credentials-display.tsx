"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Copy, KeyRound, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

export function CredentialsDisplay() {
  const router = useRouter()
  const { user } = useAuth()
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const copyToClipboard = async (text: string, type: "email" | "key") => {
    await navigator.clipboard.writeText(text)
    if (type === "email") {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80">
      {/* Header */}
      <header className="flex items-center justify-between p-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Menu className="w-6 h-6" />
          </Button>
          <span className="text-lg font-medium">¡Bienvenido!</span>
        </div>
        <div className="flex items-center gap-2 text-wai-success font-bold text-xl">
          <span>🏔️</span>
          <span>WAI</span>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pb-8">
        <p className="text-center text-primary-foreground/90 mb-6">
          Copia estos datos para iniciar sesión en la aplicación de escritorio.
        </p>

        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-wai-warning" />
                <CardTitle className="text-xl text-primary">Credenciales de Acceso</CardTitle>
              </div>
              <span className="px-4 py-1 border-2 border-wai-success text-wai-success rounded-full text-sm font-semibold">
                ACTIVA
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Plan expiration */}
            <div className="bg-wai-success/10 rounded-lg p-4 flex items-center gap-4">
              <span className="text-wai-success font-semibold text-sm">VENCIMIENTO DEL PLAN:</span>
              <span className="bg-card px-4 py-2 rounded-lg font-bold text-foreground border border-border">
                {user ? formatDate(user.planExpiration) : "10/01/2026"}
              </span>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  1
                </div>
                <span className="font-semibold text-foreground">Correo (Usuario)</span>
              </div>
              <div className="flex gap-3">
                <Input value={user?.email || ""} readOnly className="flex-1 bg-secondary border-border font-mono" />
                <Button
                  onClick={() => copyToClipboard(user?.email || "", "email")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Correo
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t border-dashed border-border" />

            {/* License Key */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  2
                </div>
                <span className="font-semibold text-foreground">Clave de Licencia</span>
              </div>
              <div className="flex gap-3">
                <Input
                  value={user?.licenseKey || ""}
                  readOnly
                  className="flex-1 bg-secondary border-border font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(user?.licenseKey || "", "key")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Clave
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-wai-success hover:bg-wai-success/90 text-white mt-4"
            >
              Continuar al Login →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
