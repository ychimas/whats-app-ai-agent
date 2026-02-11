import { NextResponse } from "next/server"
import { whatsappManager } from "@/lib/whatsapp"

export async function POST() {
    await whatsappManager.logout()
    return NextResponse.json({ success: true })
}
