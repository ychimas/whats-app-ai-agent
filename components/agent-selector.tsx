"use client"

import { useState } from "react"
import { useWAI } from "@/lib/wai-context"
import { cn } from "@/lib/utils"
import { AgentProviderModal } from "@/components/agent-provider-modal"

export function AgentSelector() {
  const { currentAgent, setCurrentAgent, agents } = useWAI()
  const [showProviderModal, setShowProviderModal] = useState(false)
  const [selectedAgentForConfig, setSelectedAgentForConfig] = useState<number | null>(null)

  const handleAgentClick = (agentId: number) => {
    const agent = agents.find((a) => a.id === agentId)

    if (!agent?.apiKey) {
      setSelectedAgentForConfig(agentId)
      setShowProviderModal(true)
    } else {
      setCurrentAgent(agentId)
    }
  }

  const handleProviderComplete = () => {
    if (selectedAgentForConfig) {
      setCurrentAgent(selectedAgentForConfig)
    }
    setShowProviderModal(false)
    setSelectedAgentForConfig(null)
  }

  return (
    <>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="bg-card border border-border rounded-2xl p-3 shadow-xl">
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider block text-center mb-3">
            AGENTES
          </span>
          <div className="flex flex-col gap-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentClick(agent.id)}
                className={cn(
                  "relative w-11 h-11 rounded-xl font-bold text-base transition-all duration-200",
                  currentAgent === agent.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-muted",
                  !agent.apiKey && "ring-2 ring-dashed ring-wai-warning/50",
                )}
              >
                {agent.id}
                {agent.isActive && agent.apiKey && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-wai-success rounded-full border-2 border-card" />
                )}
                {!agent.apiKey && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-wai-warning rounded-full border-2 border-card" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedAgentForConfig && (
        <AgentProviderModal
          open={showProviderModal}
          onOpenChange={(open) => {
            setShowProviderModal(open)
            if (!open) setSelectedAgentForConfig(null)
          }}
          agentId={selectedAgentForConfig}
        />
      )}
    </>
  )
}
