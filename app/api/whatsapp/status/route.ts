import { NextResponse } from "next/server"
import { whatsappManager } from "@/lib/whatsapp"

export async function GET() {
    return NextResponse.json(whatsappManager.getStatus())
}

export async function POST() {
    await whatsappManager.connect()
    return NextResponse.json({ success: true })
}
