"use client"

import { useState } from "react"
import { useWAI } from "@/lib/wai-context"
import { LicenseBanner } from "@/components/license-banner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Client } from "@/lib/types"

export function ClientManagement() {
  const { currentAgent, agents, clients, addClient, updateClient, deleteClient } = useWAI()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "nuevo" | "activo" | "inactivo">("all")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "" })

  const agent = agents.find((a) => a.id === currentAgent)
  const agentClients = clients.filter((c) => c.agentId === currentAgent)

  const filteredClients = agentClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm)
    const matchesFilter = filter === "all" || client.status === filter
    return matchesSearch && matchesFilter
  })

  const handleAddClient = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: "Nuevo Cliente",
      phone: "",
      status: "nuevo",
      agentId: currentAgent,
      createdAt: new Date(),
    }
    addClient(newClient)
    setSelectedClient(newClient)
    setEditForm({ name: newClient.name, phone: newClient.phone })
  }

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    setEditForm({ name: client.name, phone: client.phone })
  }

  const handleSaveClient = () => {
    if (selectedClient) {
      updateClient(selectedClient.id, { name: editForm.name, phone: editForm.phone })
    }
  }

  return (
    <div className="space-y-6">
      <LicenseBanner />

      {/* Header */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-wai-cyan bg-clip-text text-transparent">
            Gestión de Clientes
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              Agente {currentAgent}
            </span>
            <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
              {agentClients.length} clientes
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/30 border-border"
            />
          </div>
          <Select value={filter} onValueChange={(v: "all" | "nuevo" | "activo" | "inactivo") => setFilter(v)}>
            <SelectTrigger className="w-48 bg-secondary/30 border-border">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos los clientes</SelectItem>
              <SelectItem value="nuevo">Nuevos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddClient} className="bg-wai-cyan hover:bg-wai-cyan/90 text-wai-dark">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Cliente
          </Button>
        </div>
      </div>

      {/* Client List and Edit Panel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Client List */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Lista de Clientes</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                  selectedClient?.id === client.id
                    ? "border-wai-cyan bg-wai-cyan/10"
                    : "border-border hover:border-primary/50 bg-secondary/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm text-muted-foreground">{client.phone || "Sin número"}</div>
                    <div className="font-medium text-foreground">{client.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        client.status === "nuevo"
                          ? "bg-wai-cyan/20 text-wai-cyan"
                          : client.status === "activo"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-wai-cyan flex items-center justify-center">
                      <Check className="w-4 h-4 text-wai-dark" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filteredClients.length === 0 && <p className="text-center text-muted-foreground py-8">No hay clientes</p>}
          </div>
        </div>

        {/* Edit Panel */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Editar Cliente</h2>
          {selectedClient ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-foreground">Nombre</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-secondary/30 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-foreground">Teléfono</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-secondary/30 border-border"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveClient}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  Guardar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteClient(selectedClient.id)
                    setSelectedClient(null)
                  }}
                  className="shadow-lg shadow-destructive/20"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Selecciona un cliente de la lista para editarlo o agrega uno nuevo
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
