import { NextResponse } from "next/server"
import { getLogs } from "@/lib/whatsapp"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const logs = getLogs()
        return NextResponse.json({ logs })
    } catch (error) {
        console.error("Error fetching logs:", error)
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
    }
}
