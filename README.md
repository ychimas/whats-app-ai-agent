# WhatsApp AI Agent Dashboard

Este proyecto es una aplicación web moderna construida con **Next.js** que sirve como panel de control para gestionar agentes de Inteligencia Artificial integrados con WhatsApp.

## 🚀 Características Principales

### 1. Sistema de Autenticación
- Pantallas de Inicio de Sesión y Registro completas.
- Gestión de estado de sesión.

### 2. Interfaz de Usuario Moderna y Responsiva
- **Diseño Adaptable**: Funciona perfectamente en escritorio y dispositivos móviles.
- **Modo Oscuro/Claro**: Incluye un selector de tema (Dark/Light Mode) accesible en la esquina superior derecha.
- **Sidebar de Navegación**: 
  - Fijo en escritorio (no se desplaza con el contenido principal).
  - Menú hamburguesa desplegable en versión móvil.

### 3. Panel de Configuración
- **Configuración de WhatsApp**: Sección dedicada para vincular y configurar la conexión con WhatsApp.
- **Selección de Agentes**: Herramientas para seleccionar y gestionar diferentes agentes de IA (`AgentSelector`).
- **Estado de WhatsApp**: Indicador visual del estado de la conexión (`WhatsAppStatus`).

### 4. Experiencia de Usuario (UX) Mejorada
- **Loader Personalizado**: Animación de carga única con imagen personalizada y efectos de pulso/rotación.
- **Navegación Fluida**: El contenido principal es desplazable independientemente de la barra lateral, asegurando que los controles de navegación estén siempre accesibles.

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: Basados en Shadcn UI / Radix UI.
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Gestión de Temas**: `next-themes`

## 📦 Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. **Abrir en el navegador**:
   Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📂 Estructura del Proyecto

- `/app`: Rutas y páginas principales de Next.js.
- `/components`: Componentes reutilizables (Sidebar, Auth, UI).
- `/lib`: Utilidades y contextos (AuthContext, WAIContext).
- `/public`: Activos estáticos (imágenes, logos).
