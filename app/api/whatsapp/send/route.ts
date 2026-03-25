import { type NextRequest, NextResponse } from "next/server"
import { whatsappManager } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const { jid, message } = await request.json()

    if (!jid || !message) {
      return NextResponse.json({ error: "Missing required fields (jid, message)" }, { status: 400 })
    }

    const result = await whatsappManager.sendMessage(jid, message)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[WhatsApp] Send message error:", error)
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 })
  }
}
