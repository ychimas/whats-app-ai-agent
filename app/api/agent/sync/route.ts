import { NextResponse } from "next/server"
import { updateAgentConfig } from "@/lib/whatsapp"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        // We ignore agentId now, as config is global
        const { agentId: _, ...config } = body
        
        // If config is effectively the same as what we have in memory, updateConfig will now skip saving
        // But we should ensure we are not passing nulls that wipe data
        // Wai-context sends empty strings for empty fields, which is correct.
        
        updateAgentConfig(config)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to sync" }, { status: 500 })
    }
}
