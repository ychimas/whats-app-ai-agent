import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    type WASocket,
    type ConnectionState,
    type WAMessage
} from "@whiskeysockets/baileys"
import pino from "pino"
import QRCode from "qrcode"
import fs from "fs"
import path from "path"
import { generateAIResponse } from "./ai-handler"
import { ChatSession, ChatMessage } from "./types"

// GLOBAL Configuration (Single WhatsApp Number)
interface AgentConfig {
    context: string
    apiKey: string
    provider: "openai" | "gemini" | "groq"
    isActive: boolean
}

export function updateAgentConfig(config: Partial<AgentConfig>) {
    whatsappManager.updateConfig(config)
}

export function getAgentConfig() {
    return whatsappManager.config
}

function formatPhoneNumber(jid: string): string {
    const number = jid.split('@')[0]
    // If it's a group or broadcast, return as is or formatted differently
    if (jid.includes('@g.us')) return "Grupo"
    if (jid.includes('@broadcast')) return "Difusión"

    // Simple formatting: +Number
    return `+${number}`
}

export interface LogEntry {
    id: string
    timestamp: number
    message: string
    type: 'info' | 'success' | 'error' | 'incoming' | 'outgoing'
}

// Persist logs in global scope to survive hot reloads
const globalForLogs = global as unknown as { whatsappLogs: LogEntry[] }
if (!globalForLogs.whatsappLogs) globalForLogs.whatsappLogs = []

export function getLogs() {
    return globalForLogs.whatsappLogs
}

export function addLog(message: string, type: LogEntry['type'] = 'info') {
    const entry: LogEntry = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        message,
        type
    }
    globalForLogs.whatsappLogs.unshift(entry)
    if (globalForLogs.whatsappLogs.length > 50) {
        globalForLogs.whatsappLogs = globalForLogs.whatsappLogs.slice(0, 50)
    }
    return entry
}

// Persist chats in global scope
const globalForChats = global as unknown as { whatsappChats: Map<string, ChatSession> }
if (!globalForChats.whatsappChats) globalForChats.whatsappChats = new Map()

export class WhatsAppManager {
    socket: WASocket | null = null
    qrCode: string | null = null
    isConnected: boolean = false
    shouldReconnect: boolean = true
    isInitializing: boolean = false
    authDir = path.join(process.cwd(), "auth_info_baileys")
    configPath = path.join(process.cwd(), "agent_config.json")
    chatsPath = path.join(process.cwd(), "chats_data.json")

    // Config State Managed inside the class
    config: AgentConfig = {
        context: "",
        apiKey: "",
        provider: "openai",
        isActive: true
    }

    constructor() {
        this.init()
    }

    async init() {
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true })
        }
        this.loadConfig()
        this.loadChats()
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf-8')
                const loadedConfig = JSON.parse(data)
                this.config = { ...this.config, ...loadedConfig }
                console.log("[Global Agent] Configuration loaded from disk:", this.config)
            }
        } catch (error) {
            console.error("Failed to load agent config", error)
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
        } catch (error) {
            console.error("Failed to save agent config", error)
        }
    }

    loadChats() {
        try {
            if (fs.existsSync(this.chatsPath)) {
                const data = fs.readFileSync(this.chatsPath, 'utf-8')
                const loadedChats: ChatSession[] = JSON.parse(data)

                // Rehydrate the Map
                loadedChats.forEach(chat => {
                    globalForChats.whatsappChats.set(chat.jid, chat)
                })
                console.log(`[Global Agent] Loaded ${loadedChats.length} chats from disk`)
            }
        } catch (error) {
            console.error("Failed to load chats", error)
        }
    }

    saveChats() {
        try {
            const chats = Array.from(globalForChats.whatsappChats.values())
            fs.writeFileSync(this.chatsPath, JSON.stringify(chats, null, 2))
        } catch (error) {
            console.error("Failed to save chats", error)
        }
    }

    updateConfig(newConfig: Partial<AgentConfig>) {
        // Deep compare or simple shallow compare since AgentConfig is flat
        const hasChanged =
            newConfig.context !== this.config.context ||
            newConfig.apiKey !== this.config.apiKey ||
            newConfig.provider !== this.config.provider ||
            newConfig.isActive !== this.config.isActive

        if (!hasChanged) {
            console.log(`[Global Agent] Config unchanged, skipping save.`)
            return
        }

        console.log(`[Global Agent] Updating config:`, newConfig)
        this.config = { ...this.config, ...newConfig }
        this.saveConfig()
    }

    getChats(): ChatSession[] {
        return Array.from(globalForChats.whatsappChats.values()).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
    }

    getMessages(jid: string): ChatMessage[] {
        return globalForChats.whatsappChats.get(jid)?.messages || []
    }

    async sendMessage(jid: string, text: string) {
        if (!this.socket) throw new Error("WhatsApp not connected")

        await this.socket.sendMessage(jid, { text })

        // Manually add to chat history (in case upsert doesn't catch it immediately or to ensure UI update)
        // actually upsert should catch it, but let's wait for the event or just rely on upsert.
        // If we rely on upsert, we might have a slight delay.
        // Let's rely on upsert to avoid duplication, as Baileys emits upsert for own messages too.

        return { success: true }
    }

    async connect() {
        if (this.socket) {
            // If already connected, ensure we log it for the UI
            if (this.isConnected) {
                // Check if the "WhatsApp listo" log is recent, if not add it
                const lastLog = getLogs()[0]
                if (!lastLog || lastLog.message !== "WhatsApp listo") {
                    addLog("WhatsApp listo (Sesión restaurada)", 'success')
                }
            }
            return
        }

        // Prevent multiple initialization attempts
        if (this.isInitializing) {
            console.log("Already initializing, skipping...")
            return
        }

        this.isInitializing = true
        addLog("Iniciando cliente WhatsApp...", 'info')

        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.authDir)
            const { version } = await fetchLatestBaileysVersion()

            this.socket = makeWASocket({
                version,
                logger: pino({ level: "silent" }) as any,
                auth: state,
                browser: ["WAI Agent", "Chrome", "1.0.0"],
                connectTimeoutMs: 60000,
                // Ensure QR code is generated even if connection is unstable
                qrTimeout: 40000,
            })

            // Listen for QR code specifically
            this.socket.ev.on("connection.update", (update) => {
                const { qr } = update
                if (qr) {
                    console.log("QR Code received in event listener")
                }
            })

            this.socket.ev.on("connection.update", this.handleConnectionUpdate.bind(this))
            this.socket.ev.on("creds.update", saveCreds)
            this.socket.ev.on("messages.upsert", this.handleMessages.bind(this))
        } catch (error) {
            console.error("Failed to initialize WhatsApp socket", error)
            this.isInitializing = false
            addLog("Error al iniciar WhatsApp", 'error')
        }
    }

    async handleMessages({ messages, type }: { messages: WAMessage[], type: string }) {
        if (type !== "notify") return

        for (const msg of messages) {
            const jid = msg.key.remoteJid
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text

            if (!jid || !text) continue

            // 1. Update Chat History
            let chat = globalForChats.whatsappChats.get(jid)

            // Try to extract a name or phone number
            let name = msg.pushName
            if (!name) {
                if (jid.includes('@lid')) {
                    name = "Usuario (LID)"
                } else {
                    name = formatPhoneNumber(jid)
                }
            }

            if (!chat) {
                chat = {
                    jid,
                    name: name,
                    messages: [],
                    unreadCount: 0,
                    lastMessageTimestamp: 0
                }
                globalForChats.whatsappChats.set(jid, chat)
            } else {
                // Update name if available or if current name is just a raw number
                if (msg.pushName) {
                    chat.name = msg.pushName
                } else if (!chat.name || chat.name.includes('@')) {
                    chat.name = name
                }
            }

            const chatMsg: ChatMessage = {
                id: msg.key.id || Math.random().toString(36),
                role: msg.key.fromMe ? 'assistant' : 'user',
                content: text,
                timestamp: (typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : Number(msg.messageTimestamp)) * 1000 || Date.now(),
                status: 'delivered'
            }

            // Avoid duplicates
            if (!chat.messages.some(m => m.id === chatMsg.id)) {
                chat.messages.push(chatMsg)
                chat.lastMessageTimestamp = chatMsg.timestamp
                if (!msg.key.fromMe) {
                    chat.unreadCount++
                }
                this.saveChats() // Persist chat update
            }

            // 2. AI Processing (Only if Active)
            if (!this.config.isActive) {
                console.log("[Global Agent] Skipped AI response: Agent inactive")
                return
            }

            // Check context
            if (!this.config.context) {
                console.log("[Global Agent] Skipped AI response: No context provided")
                return
            }

            // Determine if it's a self-message (Note to Self)
            const myJid = this.socket?.user?.id?.split(':')[0] + "@s.whatsapp.net"
            const isSelfChat = msg.key.fromMe && jid === myJid

            // Respond if:
            // 1. It's NOT from me (standard user message)
            // 2. OR it IS from me BUT it's a self-chat (testing mode)
            if ((!msg.key.fromMe || isSelfChat)) {
                // Determine display name
                const phoneNumber = jid.split('@')[0]
                const displayName = msg.pushName || phoneNumber

                console.log(`[Global Agent] Received message from ${jid} (${displayName}): ${text}`)
                addLog(`Mensaje de ${displayName} recibido`, 'incoming')

                // TODO: Here we could add logic to "Assign" this conversation to a specific advisor (Agent 2-5)
                // For now, we just let the AI respond using the Global Context.

                this.processAIResponse(jid, text)
            }
        }
    }

    async processAIResponse(jid: string, text: string) {
        // Reload config if API key is missing, just in case
        if (!this.config.apiKey) {
            this.loadConfig()
        }

        // Log attempt
        console.log(`[Global Agent] Processing message from ${jid}: ${text}`)

        if (!this.config.isActive) {
            console.log(`[Global Agent] Skipped: Agent inactive`)
            return
        }

        if (!this.config.apiKey) {
            console.log(`[Global Agent] No API Key configured`)
            addLog("Error: No hay API Key configurada", 'error')

            // Send feedback to the user (especially helpful for testing)
            await this.socket?.sendMessage(jid, {
                text: "⚠️ *Error del Sistema*: No se ha configurado la API Key de la IA. Por favor, configúrala en el panel de administración."
            })
            return
        }

        if (!this.config.context) {
            console.log(`[Global Agent] No Context configured`)
            // Reply to prompt setup?
            return
        }

        await this.socket?.sendPresenceUpdate("composing", jid)

        try {
            const existingChat = globalForChats.whatsappChats.get(jid)
            const hasAssistantMessages = !!existingChat?.messages?.some(m => m.role === 'assistant')
            const effectiveContext = hasAssistantMessages
                ? `${this.config.context}\n\nRegla adicional: ya te presentaste antes en esta conversación. No repitas tu nombre ni tu rol a menos que el usuario lo pida explícitamente.`
                : this.config.context

            const response = await generateAIResponse(
                text,
                effectiveContext,
                this.config.apiKey,
                this.config.provider
            )

            if (!response) {
                console.error(`[Global Agent] Empty AI Response`)
                addLog(`Error: La IA no generó respuesta`, 'error')
                return
            }

            console.log(`[Global Agent] AI Response to ${jid}: ${response}`)
            addLog(`Respondiendo a ${jid.split('@')[0]}`, 'outgoing')

            await this.socket?.sendMessage(jid, { text: response })

            // Manually add AI response to chat history to ensure UI updates immediately
            // This is crucial because sometimes 'messages.upsert' doesn't trigger for own messages sent via API
            const chat = globalForChats.whatsappChats.get(jid)
            if (chat) {
                const aiMsg: ChatMessage = {
                    id: Math.random().toString(36),
                    role: 'assistant',
                    content: response,
                    timestamp: Date.now(),
                    status: 'sent'
                }
                chat.messages.push(aiMsg)
                chat.lastMessageTimestamp = aiMsg.timestamp
                this.saveChats() // Persist AI response
            }
        } catch (error) {
            console.error(`[Global Agent] AI Processing Error`, error)
            addLog(`Error procesando respuesta IA`, 'error')

            // Send feedback if AI fails
            await this.socket?.sendMessage(jid, {
                text: "❌ *Error de IA*: Hubo un problema procesando tu mensaje. Por favor intenta más tarde."
            })
        } finally {
            await this.socket?.sendPresenceUpdate("paused", jid)
        }
    }

    async handleConnectionUpdate(update: Partial<ConnectionState>) {
        const { connection, lastDisconnect, qr } = update

        // If we get a QR code or connection update, we are no longer initializing
        if (qr || connection === "open" || connection === "close") {
            this.isInitializing = false
        }

        if (qr) {
            console.log("QR Code received")
            try {
                this.qrCode = await QRCode.toDataURL(qr)
                this.isConnected = false
                this.isInitializing = false // QR received, stop initializing flag
                addLog("Escanea el código QR para vincular", 'info')
            } catch (err) {
                console.error("Failed to generate QR image", err)
            }
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut

            this.isConnected = false
            this.qrCode = null
            this.socket = null
            this.isInitializing = false // Ensure it's reset

            addLog("Conexión cerrada", 'info')

            if (shouldReconnect && this.shouldReconnect) {
                addLog("Intentando reconectar...", 'info')
                setTimeout(() => this.connect(), 5000)
            }
        } else if (connection === "open") {
            this.isConnected = true
            this.qrCode = null
            this.isInitializing = false // Ensure it's reset
            console.log(`[Global Agent] Connected successfully!`)
            addLog("WhatsApp listo", 'success')
        }
    }

    async logout() {
        this.shouldReconnect = false
        if (this.socket) {
            await this.socket.logout()
        }
        await new Promise(resolve => setTimeout(resolve, 100))

        if (fs.existsSync(this.authDir)) {
            fs.rmSync(this.authDir, { recursive: true, force: true })
        }
        this.socket = null
        this.isConnected = false
        this.qrCode = null
        addLog("Cliente WhatsApp cerrado", 'info')
    }

    getStatus() {
        return {
            isConnected: this.isConnected,
            isInitializing: this.isInitializing,
            qrCode: this.qrCode,
            // Expose the current provider to the frontend
            activeProvider: this.config.provider
        }
    }
}

// Global singleton
const globalForWhatsApp = global as unknown as { whatsappManager: WhatsAppManager }

export const whatsappManager = globalForWhatsApp.whatsappManager || new WhatsAppManager()

if (process.env.NODE_ENV !== "production") globalForWhatsApp.whatsappManager = whatsappManager
