"use client"

import type React from "react"

import { useWAI } from "@/lib/wai-context"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  MessageSquare,
  FileText,
  ImageIcon,
  Users,
  PlayCircle,
  RefreshCw,
  CreditCard,
  X,
  ArrowRight,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { MenuItem } from "@/lib/types"

const menuRoutes: Record<MenuItem, string> = {
  dashboard: "/dashboard",
  "whatsapp-config": "/whatsapp",
  "mensaje-inicial": "/mensajes/inicial",
  "mensajes-predeterminados": "/mensajes/predeterminados",
  "reconocer-imagenes": "/imagenes/reconocer",
  "gestion-clientes": "/clientes",
  tutoriales: "/tutoriales",
  remarketing: "/remarketing",
  cuenta: "/cuenta",
}

const menuItems: { id: MenuItem; label: string; icon: React.ReactNode; sublabel?: string }[] = [
  { id: "dashboard", label: "Funciones Principales", icon: <Home className="w-5 h-5" /> },
  { id: "whatsapp-config", label: "Configurar WhatsApp", icon: <MessageSquare className="w-5 h-5" /> },
  { id: "mensaje-inicial", label: "Mensaje Inicial", icon: <MessageSquare className="w-5 h-5" /> },
  { id: "mensajes-predeterminados", label: "Mensajes Predeterminados", icon: <FileText className="w-5 h-5" /> },
  { id: "reconocer-imagenes", label: "Reconocer imágenes", icon: <ImageIcon className="w-5 h-5" /> },
  { id: "gestion-clientes", label: "Gestión de Clientes", icon: <Users className="w-5 h-5" /> },
  { id: "tutoriales", label: "Tutoriales", icon: <PlayCircle className="w-5 h-5" /> },
  { id: "remarketing", label: "Remarketing", icon: <RefreshCw className="w-5 h-5" /> },
]

export function Sidebar() {
  const { activeMenu, setActiveMenu, sidebarOpen, setSidebarOpen } = useWAI()
  const { logout } = useAuth()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && (theme === "dark" || resolvedTheme === "dark") ? "/logo2.png" : "/logo.png"

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 border-r border-sidebar-border h-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-sidebar-border flex justify-center items-center gap-2">
          <div className="relative w-40 h-16">
            <Image
              src={logoSrc}
              alt="Laik Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Close button - mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Menu items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto sidebar-scroll">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={menuRoutes[item.id]}
              onClick={() => {
                setActiveMenu(item.id)
                setSidebarOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                pathname === menuRoutes[item.id] || pathname.startsWith(menuRoutes[item.id] + "/") || activeMenu === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground",
              )}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Account section */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Link
            href={menuRoutes.cuenta}
            onClick={() => {
              setActiveMenu("cuenta")
              setSidebarOpen(false)
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
              pathname === menuRoutes.cuenta || pathname.startsWith(menuRoutes.cuenta + "/") || activeMenu === "cuenta"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-medium">Cuenta</div>
                <div className="text-xs opacity-70">FACTURACION</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10 text-red-500 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
