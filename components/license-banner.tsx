"use client"

import { Infinity } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LicenseBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-wai-mint/20 to-wai-teal/10 rounded-2xl px-6 py-4 flex items-center justify-between border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Infinity className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="text-foreground">
          <div className="font-semibold">Licencia Vitalicia</div>
          <div className="text-sm text-muted-foreground">Acceso de por vida</div>
        </div>
      </div>
      <Button variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
        Ver beneficios
      </Button>
    </div>
  )
}
