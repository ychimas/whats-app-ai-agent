"use client"

import { useWAI } from "@/lib/wai-context"
import { LicenseBanner } from "@/components/license-banner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Power, RefreshCw, FileText, Key, Zap } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { ApiKeyModal } from "./api-key-modal"
import { QRModal } from "./qr-modal"
import { ContextModal } from "./context-modal"
import { AgentSelectionModal } from "./agent-selection-modal"

export function MainDashboard() {
  const { currentAgent, agents, updateAgent, whatsappStatus, setWhatsappStatus, setActiveMenu, setCurrentAgent } = useWAI()
  // Always use Agent 1 (Admin) to determine the Global Provider
  const adminAgent = agents.find((a) => a.id === 1)
  const agent = agents.find((a) => a.id === currentAgent)
  const [showApiModal, setShowApiModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [showAgentSelection, setShowAgentSelection] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/whatsapp/logs')
        if (res.ok) {
          const data = await res.json()
          if (data.logs) {
            setLogs(data.logs)
          }
        }
      } catch (e) {
        console.error("Failed to fetch logs", e)
      }
    }

    fetchLogs() // Initial fetch
    const interval = setInterval(fetchLogs, 2000) // Poll every 2s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  useEffect(() => {
    // Check if user has already selected an agent
    const savedAgent = localStorage.getItem("wai_selected_agent")
    if (savedAgent) {
      // If saved, ensure we are using that agent
      const agentId = parseInt(savedAgent)
      if (agentId !== currentAgent) {
        setCurrentAgent(agentId)
      }
    } else {
      // DEFAULT TO AGENT 1 (ADMIN) on first load if nothing is saved
      // But still show the modal to let them confirm or switch
      setCurrentAgent(1)
      setShowAgentSelection(true)
    }
  }, []) // Run only once on mount

  const providerLabel = {
    openai: "OPENAI",
    gemini: "GEMINI",
    groq: "GROQ",
  }

  const handleStartWhatsApp = () => {
    setWhatsappStatus("connecting")
    setShowQRModal(true)
  }

  const handleQRScanned = () => {
    setShowQRModal(false)
    setWhatsappStatus("connected")
    updateAgent(currentAgent, { whatsappConnected: true })
  }

  const handleStopWhatsApp = async () => {
    try {
      await fetch("/api/whatsapp/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: currentAgent })
      })
    } catch (e) {
      console.error(e)
    }
    setWhatsappStatus("disconnected")
    updateAgent(currentAgent, { whatsappConnected: false })
  }

  const handleRestartSession = () => {
    handleStopWhatsApp()
  }

  return (
    <div className="space-y-6">
      <LicenseBanner />

      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-wai-teal to-wai-mint bg-clip-text text-transparent">
          Laik: {agent?.name} {currentAgent !== 1 && `(Bajo el sistema de ${providerLabel[adminAgent?.aiProvider || "openai"]})`}
          {currentAgent === 1 && `con ${providerLabel[adminAgent?.aiProvider || "openai"]}`}
        </h1>
      </div>

      {/* Agent Status Card */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        {currentAgent === 1 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Estado del Agente IA</h2>
                <p className="text-sm text-muted-foreground">
                  El agente IA esta {agent?.isActive ? "activo" : "inactivo"} y{" "}
                  {agent?.isActive ? "respondera" : "no respondera"} mensajes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Activo</span>
                <Switch
                  checked={agent?.isActive}
                  onCheckedChange={(checked) => updateAgent(currentAgent, { isActive: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Button
                className="bg-wai-success hover:bg-wai-success/90 text-white shadow-md"
                onClick={handleStartWhatsApp}
                disabled={whatsappStatus === "connected"}
              >
                <Power className="w-4 h-4 mr-2" />
                Iniciar WhatsApp
              </Button>
              <Button
                variant="destructive"
                onClick={handleStopWhatsApp}
                disabled={whatsappStatus === "disconnected"}
                className="shadow-md"
              >
                <Power className="w-4 h-4 mr-2" />
                Cerrar WhatsApp
              </Button>
              <Button
                variant="outline"
                className="border-wai-warning text-wai-slate hover:bg-wai-warning/10 bg-transparent"
                onClick={handleRestartSession}
                disabled={whatsappStatus === "disconnected"}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar Sesion
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="secondary"
                className="bg-secondary hover:bg-muted text-secondary-foreground"
                onClick={() => setShowContextModal(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Contexto
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setShowApiModal(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Editar API KEY
              </Button>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                onClick={() => setActiveMenu("whatsapp-config")}
              >
                <Zap className="w-4 h-4 mr-2" />
                Configurar WhatsApp API
              </Button>
            </div>

            <ApiKeyModal open={showApiModal} onOpenChange={setShowApiModal} />
            <QRModal open={showQRModal} onOpenChange={setShowQRModal} onScanned={handleQRScanned} />
            <ContextModal open={showContextModal} onOpenChange={setShowContextModal} />
          </>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2 text-foreground">Vista de Asesor</h2>
            <p className="text-muted-foreground mb-4">
              Estás conectado a la línea principal de WhatsApp de la empresa.
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${whatsappStatus === 'connected'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
              <div className={`w-3 h-3 rounded-full ${whatsappStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              <span className="font-medium">
                {whatsappStatus === 'connected' ? 'Sistema Conectado' : 'Esperando Conexión del Admin'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Logs */}
      <div className="bg-secondary border border-border text-foreground rounded-2xl p-4 max-h-48 overflow-y-auto font-mono text-sm space-y-1 relative">
        {logs.length === 0 ? (
          <div className="flex items-start gap-3">
             <input type="checkbox" className="mt-1 w-4 h-4 accent-primary" defaultChecked readOnly />
             <p className="text-sm text-muted-foreground">
               Haz clic en "Iniciar WhatsApp" para activar el agente (recuerda haber ajustado el contexto si es necesario).
             </p>
          </div>
        ) : (
          logs.slice().reverse().map((log) => (
            <div key={log.id} className="flex gap-2 items-start">
              <span className="text-muted-foreground text-xs opacity-50 shrink-0 mt-0.5" suppressHydrationWarning>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={
                log.type === 'success' ? 'text-green-600 dark:text-green-400 font-medium' :
                log.type === 'error' ? 'text-red-600 dark:text-red-400 font-medium' :
                log.type === 'incoming' ? 'text-blue-600 dark:text-blue-400' :
                log.type === 'outgoing' ? 'text-purple-600 dark:text-purple-400' :
                'text-foreground'
              }>
                {log.type === 'incoming' && '📥 '}
                {log.type === 'outgoing' && '🤖 '}
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      <AgentSelectionModal open={showAgentSelection} onOpenChange={setShowAgentSelection} />
    </div>
  )
}
