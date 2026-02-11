"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, AlertTriangle, ArrowLeft } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState("")
  const [registerMethod, setRegisterMethod] = useState<"select" | "email" | "google">("select")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleGoogleRegister = () => {
    setError("")
    signIn("google", { callbackUrl: "/dashboard" })
  }

  const handleEmailRegister = () => {
    if (!email) {
      setError("Ingresa tu correo electronico")
      return
    }
    if (!password) {
      setError("Ingresa una contrasena")
      return
    }
    register(email)
    router.push("/credentials")
  }

  if (registerMethod === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="w-full max-w-sm shadow-xl border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-destructive">3 DIAS GRATIS!</CardTitle>
            <p className="text-sm text-muted-foreground">Registrate y obten acceso completo a</p>
            <p className="text-sm font-semibold text-foreground">Laik - WhatsApp Agente IA</p>
            <a href="#" className="text-primary text-sm hover:underline">
              Todas las funciones premium
            </a>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleRegister}
              variant="outline"
              className="w-full border border-border hover:bg-secondary bg-transparent h-12"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Registrarse con Google
            </Button>

            <Button
              onClick={() => {
                setRegisterMethod("email")
                setError("")
              }}
              className="w-full bg-wai-success hover:bg-wai-success/90 text-white h-12"
            >
              Registrarse con Correo
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-sm shadow-xl border-primary/20">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Registro con Correo</CardTitle>
          <p className="text-sm text-muted-foreground">Crea tu cuenta con tu correo electronico</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 border border-border"
              autoFocus
            />
          </div>

          <Input
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-border"
          />

          {error && (
            <div className="bg-wai-warning/20 border border-wai-warning rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-wai-warning" />
              <span className="text-sm text-foreground">{error}</span>
            </div>
          )}

          <Button onClick={handleEmailRegister} className="w-full bg-wai-success hover:bg-wai-success/90 text-white">
            Crear cuenta
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setRegisterMethod("select")
              setError("")
            }}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
