"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, KeyRound, AlertTriangle } from "lucide-react"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { ModeToggle } from "@/components/mode-toggle"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [licenseKey, setLicenseKey] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")

  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && (theme === "dark" || resolvedTheme === "dark") ? "/logo2.png" : "/logo.png"

  const handleGoogleLogin = () => {
    if (!acceptTerms) {
      setError("Debes aceptar los terminos y condiciones")
      return
    }
    signIn("google", { callbackUrl: "/dashboard" })
  }

  const handleLogin = () => {
    setError("")

    if (!acceptTerms) {
      setError("Debes aceptar los terminos y condiciones")
      return
    }

    if (!email || !licenseKey) {
      setError("Ingresa tu correo y clave de licencia")
      return
    }

    const success = login(email, licenseKey)
    if (!success) {
      setError("Credenciales invalidas")
      return
    }
    router.push("/select-provider")
  }

  const handleRegister = () => {
    setError("")

    if (!acceptTerms) {
      setError("Debes aceptar los terminos y condiciones")
      return
    }

    router.push("/register")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/20 via-background to-background p-4 relative overflow-hidden">

      {/* Absolute toggle for easy access */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wai-mint/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

      <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur-sm bg-card/80 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6 relative h-16">
            <Image
              src={logoSrc}
              alt="Laik Logo"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Bienvenido a Laik</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Tu asistente inteligente para WhatsApp
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              type="email"
              placeholder="Correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 border-2 border-primary/30 focus:border-primary"
            />
          </div>

          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wai-warning" />
            <Input
              type="password"
              placeholder="Clave Licencia"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="pl-10 border-2 border-primary/30 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="border-wai-success data-[state=checked]:bg-wai-success"
            />
            <label htmlFor="terms" className="text-sm text-foreground">
              Acepto los{" "}
              <a href="#" className="text-primary hover:underline">
                terminos y condiciones
              </a>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleRegister} className="bg-wai-success hover:bg-wai-success/90 text-white">
              Registrarse
            </Button>
            <Button
              variant="outline"
              onClick={handleLogin}
              className="border-2 border-primary/30 hover:bg-primary/5 bg-transparent"
            >
              Ingresar
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O continua con</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full border-2 border-primary/30 hover:bg-primary/5 bg-transparent"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          {error && (
            <div className="bg-wai-warning/20 border border-wai-warning rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-wai-warning" />
              <span className="text-sm text-foreground">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
