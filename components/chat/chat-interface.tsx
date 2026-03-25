"use client"

import { useState, useEffect, useRef } from "react"
import { useWAI } from "@/lib/wai-context"
import { ChatSession, ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Phone, Video, MoreVertical, Search, Paperclip, Mic } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function ChatInterface() {
    const [chats, setChats] = useState<ChatSession[]>([])
    const [selectedJid, setSelectedJid] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { currentAgent } = useWAI()

    // Fetch Chats
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch("/api/whatsapp/chats")
                if (res.ok) {
                    const data = await res.json()
                    setChats(data.chats || [])
                }
            } catch (error) {
                console.error("Error fetching chats:", error)
            }
        }

        fetchChats()
        const interval = setInterval(fetchChats, 3000)
        return () => clearInterval(interval)
    }, [])

    // Fetch Messages for Selected Chat
    useEffect(() => {
        if (!selectedJid) return

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/whatsapp/chats/${encodeURIComponent(selectedJid)}`)
                if (res.ok) {
                    const data = await res.json()
                    setMessages(data.messages || [])
                }
            } catch (error) {
                console.error("Error fetching messages:", error)
            }
        }

        fetchMessages()
        const interval = setInterval(fetchMessages, 2000)
        return () => clearInterval(interval)
    }, [selectedJid])

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputText.trim() || !selectedJid) return

        const tempId = Math.random().toString(36)
        const optimisticMsg: ChatMessage = {
            id: tempId,
            role: "assistant",
            content: inputText,
            timestamp: Date.now(),
            status: "sent"
        }

        // Optimistic update
        setMessages(prev => [...prev, optimisticMsg])
        setInputText("")

        try {
            const res = await fetch("/api/whatsapp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jid: selectedJid,
                    message: optimisticMsg.content
                })
            })

            if (!res.ok) {
                console.error("Failed to send message")
                // TODO: Show error toast or mark message as failed
            }
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    const selectedChat = chats.find(c => c.jid === selectedJid)

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-background rounded-2xl border overflow-hidden shadow-sm">
            {/* Sidebar - Chat List */}
            <div className="w-80 shrink-0 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b space-y-4">
                    <h2 className="font-semibold text-lg">Chats</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar chat..." className="pl-9 bg-background" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {chats.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No hay chats activos
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.jid}
                                    onClick={() => setSelectedJid(chat.jid)}
                                    className={cn(
                                        "flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50 w-full border-b border-border/40",
                                        selectedJid === chat.jid && "bg-accent"
                                    )}
                                >
                                    <Avatar className="h-12 w-12 shrink-0">
                                        <AvatarFallback>{chat.jid.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 grid gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold truncate text-base">
                                                {chat.name || chat.jid.split('@')[0]}
                                            </span>
                                            {chat.lastMessageTimestamp > 0 && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 shrink-0">
                                                    {format(chat.lastMessageTimestamp, "HH:mm")}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate leading-none pb-1">
                                            {chat.messages[chat.messages.length - 1]?.content || "Sin mensajes"}
                                        </p>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background min-w-0">
                {selectedJid ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-muted/5">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{selectedChat?.jid.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">{selectedChat?.name || selectedChat?.jid.split('@')[0]}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedChat?.messages.length} mensajes
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div 
                            className="flex-1 overflow-y-auto p-4 bg-[#efe7dd] dark:bg-[#0b141a]"
                        >
                            <div className="flex flex-col gap-2 max-w-3xl mx-auto">
                                {messages.map((msg, index) => {
                                    const isMe = msg.role === 'assistant'
                                    return (
                                        <div
                                            key={msg.id || index}
                                            className={cn(
                                                "flex w-max max-w-[80%] flex-col gap-1 px-3 py-1.5 text-sm shadow-sm",
                                                isMe
                                                    ? "ml-auto bg-[#d9fdd3] text-black dark:bg-[#005c4b] dark:text-white rounded-l-lg rounded-tr-none rounded-br-lg"
                                                    : "bg-white text-black dark:bg-[#202c33] dark:text-white rounded-r-lg rounded-tl-none rounded-bl-lg"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap break-words text-[14.2px] leading-relaxed">{msg.content}</p>
                                            <span className={cn(
                                                "text-[10px] self-end",
                                                isMe ? "text-gray-500 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"
                                            )}>
                                                {format(msg.timestamp, "HH:mm")}
                                            </span>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-3xl mx-auto">
                                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Escribe un mensaje..."
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="pr-10 py-6"
                                    />
                                </div>
                                {inputText.trim() ? (
                                    <Button type="submit" size="icon" className="shrink-0">
                                        <Send className="h-5 w-5" />
                                    </Button>
                                ) : (
                                    <Button type="button" variant="ghost" size="icon" className="shrink-0">
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                            <MessageSquareIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Chat en Vivo</h3>
                        <p className="text-sm max-w-sm text-center">
                            Selecciona una conversación de la lista para ver el historial y responder en tiempo real.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
