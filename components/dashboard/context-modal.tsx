"use client"

import { useWAI } from "@/lib/wai-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check, FileText } from "lucide-react"

interface ContextModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContextModal({ open, onOpenChange }: ContextModalProps) {
  const { currentAgent, agents, updateAgent } = useWAI()
  const agent = agents.find((a) => a.id === currentAgent)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold text-foreground">
            Definir Contexto de IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
                Define aquí cómo debe comportarse tu agente, qué información puede dar y qué tono debe usar.
            </p>
            
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary mb-2 justify-center">
              <FileText className="w-5 h-5 text-wai-teal" />
              <h3 className="text-lg font-bold text-wai-teal">
                Instrucciones del Sistema
              </h3>
            </div>

            <Textarea
              placeholder="Ejemplo: Tu nombre es yesAI y trabajas para jfsoftware..."
              value={agent?.context || ""}
              onChange={(e) => updateAgent(currentAgent, { context: e.target.value })}
              className="min-h-[200px] bg-secondary/30 border-border font-mono text-sm"
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button
              className="bg-wai-success hover:bg-wai-success/90 text-white px-8"
              onClick={() => onOpenChange(false)}
            >
              <Check className="w-4 h-4 mr-2" />
              Guardar Contexto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
