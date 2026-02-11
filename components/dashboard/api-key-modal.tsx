"use client"

import { useWAI } from "@/lib/wai-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Key, Check } from "lucide-react"

interface ApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiKeyModal({ open, onOpenChange }: ApiKeyModalProps) {
  const { currentAgent, agents, updateAgent } = useWAI()
  const agent = agents.find((a) => a.id === currentAgent)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold text-foreground">
            Selecciona el Proveedor de IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Select
            value={agent?.aiProvider}
            onValueChange={(value: "openai" | "gemini" | "groq") => updateAgent(currentAgent, { aiProvider: value })}
          >
            <SelectTrigger className="w-full bg-secondary/50 border-border">
              <SelectValue placeholder="Selecciona un proveedor" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="groq">Groq (Llama 4 de Meta) Gratis y pago | Aprox. 1 USD al mes</SelectItem>
              <SelectItem value="gemini">Google (Gemini Flash) Gratis y pago | Aprox. 4 USD al mes</SelectItem>
              <SelectItem value="openai">OpenAI (ChatGPT O4 Mini) Solo pago | Aprox. 10 USD al mes</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Key className="w-6 h-6 text-wai-warning" />
              <h3 className="text-xl font-bold text-wai-teal">
                API Key de{" "}
                {agent?.aiProvider === "openai" ? "OpenAI" : agent?.aiProvider === "gemini" ? "Gemini" : "Groq"}
              </h3>
            </div>

            <Input
              placeholder={`Copia la API KEY de ${agent?.aiProvider === "openai" ? "OpenAI" : agent?.aiProvider === "gemini" ? "Gemini" : "Groq"}...`}
              value={agent?.apiKey || ""}
              onChange={(e) => updateAgent(currentAgent, { apiKey: e.target.value })}
              className="mb-4 bg-secondary/30 border-border"
            />
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-wai-success hover:bg-wai-success/90 text-white px-8"
              onClick={() => onOpenChange(false)}
            >
              <Check className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
