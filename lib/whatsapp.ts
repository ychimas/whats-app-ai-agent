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

// GLOBAL Configuration (Single WhatsApp Number)
interface AgentConfig {
    context: string
    apiKey: string
    provider: "openai" | "gemini" | "groq"
    isActive: boolean
}

let agentConfig: AgentConfig = {
    context: "",
    apiKey: "",
    provider: "openai",
    isActive: false
}

export function updateAgentConfig(config: Partial<AgentConfig>) {
    agentConfig = { ...agentConfig, ...config }
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

export class WhatsAppManager {
    socket: WASocket | null = null
    qrCode: string | null = null
    isConnected: boolean = false
    shouldReconnect: boolean = true
    authDir = path.join(process.cwd(), "auth_info_baileys")

    constructor() {
        this.init()
    }

    async init() {
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true })
        }
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

        addLog("Iniciando cliente WhatsApp...", 'info')

        const { state, saveCreds } = await useMultiFileAuthState(this.authDir)
        const { version } = await fetchLatestBaileysVersion()

        this.socket = makeWASocket({
            version,
            logger: pino({ level: "silent" }) as any,
            auth: state,
            browser: ["WAI Agent", "Chrome", "1.0.0"],
            connectTimeoutMs: 60000,
        })

        this.socket.ev.on("connection.update", this.handleConnectionUpdate.bind(this))
        this.socket.ev.on("creds.update", saveCreds)
        this.socket.ev.on("messages.upsert", this.handleMessages.bind(this))
    }

    async handleMessages({ messages, type }: { messages: WAMessage[], type: string }) {
        if (type !== "notify") return

        // Only respond if the global config is active
        if (!agentConfig.isActive) return

        for (const msg of messages) {
            const jid = msg.key.remoteJid
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text

            if (!jid || !text) continue

            // Determine if it's a self-message (Note to Self)
            const myJid = this.socket?.user?.id?.split(':')[0] + "@s.whatsapp.net"
            const isSelfChat = msg.key.fromMe && jid === myJid

            // Respond if:
            // 1. It's NOT from me (standard user message)
            // 2. OR it IS from me BUT it's a self-chat (testing mode)
            if ((!msg.key.fromMe || isSelfChat)) {
                const phoneNumber = jid.split('@')[0]
                console.log(`[Global Agent] Received message from ${jid}: ${text}`)
                addLog(`Mensaje de ${phoneNumber} recibido`, 'incoming')

                // TODO: Here we could add logic to "Assign" this conversation to a specific advisor (Agent 2-5)
                // For now, we just let the AI respond using the Global Context.

                this.processAIResponse(jid, text)
            }
        }
    }

    async processAIResponse(jid: string, text: string) {
        if (!agentConfig.apiKey) {
            console.log(`[Global Agent] No API Key configured`)
            addLog("Error: No hay API Key configurada", 'error')
            return
        }

        await this.socket?.sendPresenceUpdate("composing", jid)

        const response = await generateAIResponse(
            text,
            agentConfig.context,
            agentConfig.apiKey,
            agentConfig.provider
        )

        console.log(`[Global Agent] AI Response to ${jid}: ${response}`)
        addLog(`Respondiendo a ${jid.split('@')[0]}`, 'outgoing')

        await this.socket?.sendMessage(jid, { text: response })
        await this.socket?.sendPresenceUpdate("paused", jid)
    }

    async handleConnectionUpdate(update: Partial<ConnectionState>) {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            this.qrCode = await QRCode.toDataURL(qr)
            this.isConnected = false
            addLog("Escanea el código QR para vincular", 'info')
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut

            this.isConnected = false
            this.qrCode = null
            this.socket = null
            
            addLog("Conexión cerrada", 'info')

            if (shouldReconnect && this.shouldReconnect) {
                addLog("Intentando reconectar...", 'info')
                setTimeout(() => this.connect(), 5000)
            }
        } else if (connection === "open") {
            this.isConnected = true
            this.qrCode = null
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
            qrCode: this.qrCode,
            // Expose the current provider to the frontend
            activeProvider: agentConfig.provider
        }
    }
}

// Global singleton
const globalForWhatsApp = global as unknown as { whatsappManager: WhatsAppManager }

export const whatsappManager = globalForWhatsApp.whatsappManager || new WhatsAppManager()

if (process.env.NODE_ENV !== "production") globalForWhatsApp.whatsappManager = whatsappManager
