export interface Client {
  id: string
  name: string
  phone: string
  status: "nuevo" | "activo" | "inactivo"
  agentId: number
  createdAt: Date
}

export interface PresetMessage {
  id: string
  keywords: string[]
  message: string
  attachments: { name: string; type: string }[]
  agentId: number
}

export interface Agent {
  id: number
  name: string
  aiProvider: "openai" | "gemini" | "groq"
  apiKey: string
  context: string
  isActive: boolean
  whatsappConnected: boolean
}

export interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  businessAccountId: string
}

export interface User {
  id: string
  email: string
  licenseKey: string
  planExpiration: Date
  isActive: boolean
  selectedProvider?: "openai" | "gemini" | "groq"
  providerApiKey?: string
  name?: string
  image?: string
}

export type AuthStep = "login" | "register" | "credentials" | "select-provider" | "app"

export type MenuItem =
  | "dashboard"
  | "mensaje-inicial"
  | "mensajes-predeterminados"
  | "reconocer-imagenes"
  | "gestion-clientes"
  | "tutoriales"
  | "remarketing"
  | "cuenta"
  | "whatsapp-config"
