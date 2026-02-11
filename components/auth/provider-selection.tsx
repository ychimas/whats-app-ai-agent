"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useWAI } from "@/lib/wai-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Check, KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"

const providers = [
  {
    id: "groq",
    name: "Groq (Llama 4 de Meta)",
    description: "Gratis y pago | Aprox. 1 USD al mes",
    apiKeyPlaceholder: "Copia la API KEY de Groq...",
    link: "https://console.groq.com/",
    linkText: "Ir a Groq",
  },
  {
    id: "gemini",
    name: "Google (Gemini Flash)",
    description: "Gratis y pago | Aprox. 4 USD al mes",
    apiKeyPlaceholder: "Copia la API KEY de Google...",
    link: "https://aistudio.google.com/",
    linkText: "Ir a Google AI",
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT O4 Mini)",
    description: "Solo pago | Aprox. 10 USD al mes",
    apiKeyPlaceholder: "Copia la API KEY de OpenAI...",
    link: "https://platform.openai.com/",
    linkText: "Ir a OpenAI",
  },
]

interface ProviderSelectionProps {
  agentId?: number
  onComplete?: () => void
  isModal?: boolean
}

export function ProviderSelection({ agentId, onComplete, isModal = false }: ProviderSelectionProps) {
  const router = useRouter()
  const { selectProvider, authStep } = useAuth()
  const { currentAgent, updateAgent, agents } = useWAI()
  const [selectedProvider, setSelectedProvider] = useState<string>("groq")
  const [apiKey, setApiKey] = useState("")

  const targetAgentId = agentId ?? currentAgent
  const agent = agents.find((a) => a.id === targetAgentId)

  useEffect(() => {
    if (agent?.aiProvider) {
      setSelectedProvider(agent.aiProvider)
    }
    if (agent?.apiKey) {
      setApiKey(agent.apiKey)
    }
  }, [agent])

  const currentProvider = providers.find((p) => p.id === selectedProvider)

  const handleSave = () => {
    if (apiKey && selectedProvider) {
      updateAgent(targetAgentId, {
        aiProvider: selectedProvider as "openai" | "gemini" | "groq",
        apiKey: apiKey,
      })

      if (isModal && onComplete) {
        onComplete()
      } else if (authStep === "select-provider") {
        selectProvider(selectedProvider as "openai" | "gemini" | "groq", apiKey)
        router.push("/dashboard")
      }
    }
  }

  const content = (
    <div className="space-y-6">
      {agentId && (
        <div className="text-center">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            Configurando Agente {agentId}
          </span>
        </div>
      )}

      {/* Provider selector */}
      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
        <SelectTrigger className="w-full border-2 border-primary focus:ring-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <span className="font-medium">{provider.name}</span>
              <span className="text-muted-foreground ml-1 text-xs">{provider.description}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* API Key section */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-primary">
          <KeyRound className="w-5 h-5 text-wai-warning" />
          <span className="text-lg font-semibold">API Key de {currentProvider?.name.split(" ")[0]}</span>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <Input
          type="password"
          placeholder={currentProvider?.apiKeyPlaceholder}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border-2 border-primary/30 focus:border-primary"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 bg-muted hover:bg-muted/80"
          onClick={() => window.open(currentProvider?.link, "_blank")}
        >
          <Globe className="w-4 h-4 mr-2" />
          {currentProvider?.linkText}
        </Button>
        <Button
          onClick={handleSave}
          disabled={!apiKey}
          className="flex-1 bg-wai-success hover:bg-wai-success/90 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Guardar
        </Button>
      </div>
    </div>
  )

  if (isModal) {
    return content
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Selecciona el Proveedor de IA</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  )
}
