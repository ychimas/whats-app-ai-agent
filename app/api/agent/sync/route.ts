import { NextResponse } from "next/server"
import { updateAgentConfig } from "@/lib/whatsapp"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        // We ignore agentId now, as config is global
        const { agentId: _, ...config } = body
        
        updateAgentConfig(config)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to sync" }, { status: 500 })
    }
}
