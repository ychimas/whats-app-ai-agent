"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Agent, Client, PresetMessage, MenuItem, WhatsAppConfig } from "./types"
import { usePathname } from "next/navigation"

interface WAIContextType {
  currentAgent: number
  setCurrentAgent: (id: number) => void
  agents: Agent[]
  setAgents: (agents: Agent[]) => void
  updateAgent: (id: number, data: Partial<Agent>) => void
  clients: Client[]
  setClients: (clients: Client[]) => void
  addClient: (client: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  presetMessages: PresetMessage[]
  setPresetMessages: (messages: PresetMessage[]) => void
  addPresetMessage: (message: PresetMessage) => void
  deletePresetMessage: (id: string) => void
  activeMenu: MenuItem
  setActiveMenu: (menu: MenuItem) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  whatsappConfig: WhatsAppConfig
  setWhatsappConfig: (config: WhatsAppConfig) => void
  whatsappStatus: "disconnected" | "connecting" | "connected"
  setWhatsappStatus: (status: "disconnected" | "connecting" | "connected") => void
}

const WAIContext = createContext<WAIContextType | undefined>(undefined)

const defaultAgents: Agent[] = [
  { id: 1, name: "Agente 1", aiProvider: "gemini", apiKey: "", context: "", isActive: true, whatsappConnected: false },
  { id: 2, name: "Agente 2", aiProvider: "openai", apiKey: "", context: "", isActive: false, whatsappConnected: false },
  { id: 3, name: "Agente 3", aiProvider: "openai", apiKey: "", context: "", isActive: false, whatsappConnected: false },
  { id: 4, name: "Agente 4", aiProvider: "groq", apiKey: "", context: "", isActive: false, whatsappConnected: false },
  { id: 5, name: "Agente 5", aiProvider: "openai", apiKey: "", context: "", isActive: false, whatsappConnected: false },
]

const defaultClients: Client[] = [
  { id: "1", name: "cliente", phone: "573001234567", status: "nuevo", agentId: 1, createdAt: new Date() },
  { id: "2", name: "cliente", phone: "573009876543", status: "nuevo", agentId: 1, createdAt: new Date() },
]

const defaultPresetMessages: PresetMessage[] = [
  {
    id: "1",
    keywords: ["foto"],
    message: "",
    attachments: [{ name: "Diseño sin título (1).png", type: "image/png" }],
    agentId: 1,
  },
]

const defaultWhatsAppConfig: WhatsAppConfig = {
  phoneNumberId: "",
  accessToken: "",
  webhookVerifyToken: "",
  businessAccountId: "",
}

import { updateAgentConfig } from "./whatsapp"

function menuFromPathname(pathname: string): MenuItem | null {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "dashboard"
  if (pathname === "/whatsapp" || pathname.startsWith("/whatsapp/")) return "whatsapp-config"
  if (pathname === "/mensajes/inicial" || pathname.startsWith("/mensajes/inicial/")) return "mensaje-inicial"
  if (pathname === "/mensajes/predeterminados" || pathname.startsWith("/mensajes/predeterminados/"))
    return "mensajes-predeterminados"
  if (pathname === "/imagenes/reconocer" || pathname.startsWith("/imagenes/reconocer/")) return "reconocer-imagenes"
  if (pathname === "/clientes" || pathname.startsWith("/clientes/")) return "gestion-clientes"
  if (pathname === "/tutoriales" || pathname.startsWith("/tutoriales/")) return "tutoriales"
  if (pathname === "/remarketing" || pathname.startsWith("/remarketing/")) return "remarketing"
  if (pathname === "/cuenta" || pathname.startsWith("/cuenta/")) return "cuenta"
  return null
}

export function WAIProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [currentAgent, setCurrentAgent] = useState(1)
  const [agents, setAgents] = useState<Agent[]>(defaultAgents)
  const [clients, setClients] = useState<Client[]>(defaultClients)
  const [presetMessages, setPresetMessages] = useState<PresetMessage[]>(defaultPresetMessages)
  const [activeMenu, setActiveMenu] = useState<MenuItem>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>(defaultWhatsAppConfig)
  const [whatsappStatus, setWhatsappStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")

  useEffect(() => {
    const menu = menuFromPathname(pathname)
    if (menu && menu !== activeMenu) {
      setActiveMenu(menu)
    }
  }, [activeMenu, pathname])

  // Sync with backend config whenever current agent changes
  useEffect(() => {
    // Only sync if it's the Master Agent (ID 1)
    if (currentAgent !== 1) return;

    const agent = agents.find(a => a.id === currentAgent)
    if (agent) {
      fetch('/api/agent/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: agent.context,
          apiKey: agent.apiKey,
          provider: agent.aiProvider,
          isActive: agent.isActive
        })
      }).catch(console.error)
    }
  }, [currentAgent, agents])

  const updateAgent = (id: number, data: Partial<Agent>) => {
    setAgents((prev) => prev.map((agent) => (agent.id === id ? { ...agent, ...data } : agent)))
  }

  const addClient = (client: Client) => {
    setClients((prev) => [...prev, client])
  }

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...data } : client)))
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id))
  }

  const addPresetMessage = (message: PresetMessage) => {
    setPresetMessages((prev) => [...prev, message])
  }

  const deletePresetMessage = (id: string) => {
    setPresetMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  return (
    <WAIContext.Provider
      value={{
        currentAgent,
        setCurrentAgent,
        agents,
        setAgents,
        updateAgent,
        clients,
        setClients,
        addClient,
        updateClient,
        deleteClient,
        presetMessages,
        setPresetMessages,
        addPresetMessage,
        deletePresetMessage,
        activeMenu,
        setActiveMenu,
        sidebarOpen,
        setSidebarOpen,
        whatsappConfig,
        setWhatsappConfig,
        whatsappStatus,
        setWhatsappStatus,
      }}
    >
      {children}
    </WAIContext.Provider>
  )
}

export function useWAI() {
  const context = useContext(WAIContext)
  if (!context) {
    throw new Error("useWAI must be used within a WAIProvider")
  }
  return context
}
