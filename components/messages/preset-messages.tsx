"use client"

import { useState } from "react"
import { useWAI } from "@/lib/wai-context"
import { LicenseBanner } from "@/components/license-banner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X, FileImage, Plus } from "lucide-react"
import type { PresetMessage } from "@/lib/types"

export function PresetMessages() {
  const { currentAgent, presetMessages, addPresetMessage, deletePresetMessage } = useWAI()
  const [keywords, setKeywords] = useState("")
  const [message, setMessage] = useState("")

  const agentMessages = presetMessages.filter((m) => m.agentId === currentAgent)

  const handleAddMessage = () => {
    if (!keywords.trim()) return

    const newMessage: PresetMessage = {
      id: Date.now().toString(),
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      message,
      attachments: [],
      agentId: currentAgent,
    }
    addPresetMessage(newMessage)
    setKeywords("")
    setMessage("")
  }

  return (
    <div className="space-y-6">
      <LicenseBanner />

      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-wai-cyan bg-clip-text text-transparent mb-2">
          Mensajes Predeterminados
        </h1>
        <p className="text-muted-foreground">
          Define respuestas automáticas para palabras clave o frases específicas. Puedes incluir texto y archivos.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add New Message */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-foreground">
                {"Palabras Clave (separadas por comas, ej: horario, abierto, atencion):"}
              </label>
              <Input
                placeholder="ej: horario, abierto, atencion"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="bg-secondary/30 border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-foreground">
                Mensaje de Texto Complementario (opcional):
              </label>
              <Textarea
                placeholder="Este es el texto que se enviará junto al archivo..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="bg-secondary/30 border-border"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent border-border hover:bg-secondary">
                <FileImage className="w-4 h-4 mr-2" />
                Adjuntar Archivo
              </Button>
              <Button onClick={handleAddMessage} className="flex-1 bg-wai-cyan hover:bg-wai-cyan/90 text-wai-dark">
                <Plus className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Messages */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-wai-cyan bg-clip-text text-transparent mb-4">
            Grupos Predeterminados Guardados
          </h2>
          <div className="space-y-4">
            {agentMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">Palabras Clave:</span>
                      <div className="flex flex-wrap gap-1">
                        {msg.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center gap-1"
                          >
                            {keyword}
                            <button className="hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    {msg.attachments.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-foreground">Archivos Adjuntos:</span>
                        {msg.attachments.map((file, i) => (
                          <div key={i} className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <FileImage className="w-4 h-4" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.message && <p className="mt-2 text-sm text-muted-foreground">{msg.message}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePresetMessage(msg.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {agentMessages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay mensajes predeterminados guardados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
