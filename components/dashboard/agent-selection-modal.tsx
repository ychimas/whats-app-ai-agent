"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWAI } from "@/lib/wai-context"
import { User, Shield } from "lucide-react"

interface AgentSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentSelectionModal({ open, onOpenChange }: AgentSelectionModalProps) {
  const { agents, setCurrentAgent } = useWAI()

  const handleSelectAgent = (agentId: number) => {
    setCurrentAgent(agentId)
    // Save to localStorage to persist choice
    localStorage.setItem("wai_selected_agent", agentId.toString())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold text-foreground">
            Selecciona tu Perfil
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            ¿Quién eres hoy?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          {agents.map((agent) => (
            <Button
              key={agent.id}
              variant="outline"
              className={`h-16 justify-start px-4 text-left hover:bg-secondary/50 border-border ${
                agent.id === 1 ? "border-primary/50 bg-primary/5" : ""
              }`}
              onClick={() => handleSelectAgent(agent.id)}
            >
              <div className={`p-2 rounded-full mr-4 ${
                agent.id === 1 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {agent.id === 1 ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{agent.name}</span>
                <span className="text-xs text-muted-foreground">
                    {agent.id === 1 ? "Administrador & Configuración" : "Asesor Comercial"}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
