import { NextRequest, NextResponse } from "next/server"
import { whatsappManager } from "@/lib/whatsapp"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jid: string }> }
) {
    try {
        const { jid } = await params
        const decodedJid = decodeURIComponent(jid)
        const messages = whatsappManager.getMessages(decodedJid)
        return NextResponse.json({ messages })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}
