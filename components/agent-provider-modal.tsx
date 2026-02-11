"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProviderSelection } from "@/components/auth/provider-selection"
import { useWAI } from "@/lib/wai-context"

interface AgentProviderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: number
}

export function AgentProviderModal({ open, onOpenChange, agentId }: AgentProviderModalProps) {
  const { setCurrentAgent } = useWAI()

  const handleComplete = () => {
    setCurrentAgent(agentId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Selecciona el Proveedor de IA</DialogTitle>
        </DialogHeader>
        <ProviderSelection agentId={agentId} onComplete={handleComplete} isModal />
      </DialogContent>
    </Dialog>
  )
}
