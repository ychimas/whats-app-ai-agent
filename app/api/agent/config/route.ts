import { NextResponse } from "next/server"
import { getAgentConfig } from "@/lib/whatsapp"

export async function GET() {
    try {
        const config = getAgentConfig()
        return NextResponse.json(config)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
    }
}
