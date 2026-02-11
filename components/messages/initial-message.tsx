"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useWAI } from "@/lib/wai-context"
import { LicenseBanner } from "@/components/license-banner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, X, Save, Info } from "lucide-react"

interface AttachedFile {
  name: string
  type: string
  size: number
}

export function InitialMessage() {
  const { currentAgent } = useWAI()
  const [isEnabled, setIsEnabled] = useState(false)
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }))
      setAttachments((prev) => [...prev, ...newFiles])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // Save logic here
    alert("Mensaje inicial guardado!")
  }

  return (
    <div className="space-y-6">
      <LicenseBanner />

      {/* Header with agent indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-wai-teal">Mensaje Inicial</h1>
        <div className="bg-gradient-to-r from-wai-teal to-wai-mint text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <span className="font-medium">Agente:</span>
          <span className="bg-white/20 px-3 py-1 rounded-full font-bold">{currentAgent}</span>
        </div>
      </div>

      {/* Toggle card */}
      <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
        <div className="flex items-center gap-4">
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} className="data-[state=checked]:bg-wai-success" />
          <span className="text-foreground font-medium">Mensaje inicial {isEnabled ? "activado" : "desactivado"}</span>
        </div>
      </div>

      {/* Message textarea card */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <label className="block text-foreground font-semibold mb-3">Texto del mensaje:</label>
        <Textarea
          placeholder="Escribe aqui el mensaje inicial que se enviara automaticamente..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[150px] bg-background border-border resize-y"
        />
      </div>

      {/* Attachments card */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <label className="text-foreground font-semibold">Archivos adjuntos:</label>
          <Button
            className="bg-wai-success hover:bg-wai-success/90 text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Agregar archivos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
        </div>

        {/* Attachment list */}
        {attachments.length > 0 && (
          <div className="space-y-2 mt-4">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{file.name}</span>
                </div>
                <button onClick={() => removeAttachment(index)} className="text-destructive hover:text-destructive/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button card */}
      <div className="bg-card rounded-2xl p-4 shadow-lg border border-border">
        <Button
          className="w-full bg-wai-success hover:bg-wai-success/90 text-white py-6 text-lg font-semibold"
          onClick={handleSave}
        >
          <Save className="w-5 h-5 mr-2" />
          Guardar mensaje inicial
        </Button>
      </div>

      {/* Information box */}
      <div className="bg-wai-info/20 border-l-4 border-wai-info rounded-r-2xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-wai-info mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-wai-info mb-2">Informacion</h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li>• El mensaje inicial se enviara automaticamente cuando este activado</li>
              <li>• Puedes adjuntar archivos compatibles con WhatsApp</li>
              <li>• Los tipos de archivo soportados incluyen: imagenes, videos, audios, PDFs y documentos de Office</li>
              <li>• Puedes agregar multiples archivos al mensaje</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
