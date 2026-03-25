import { NextResponse } from "next/server"
import { whatsappManager } from "@/lib/whatsapp"

export async function GET() {
    try {
        const chats = whatsappManager.getChats()
        // Convert Map/Set to array for JSON
        return NextResponse.json({ chats })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
    }
}
