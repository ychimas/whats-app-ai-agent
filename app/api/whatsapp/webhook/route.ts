import { type NextRequest, NextResponse } from "next/server"

// Webhook verification (GET request from Meta)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Use a default token that can be configured from the UI
  // The user sets this same token in Meta Developers webhook config
  const VERIFY_TOKEN = "wai_verify_token_2024"

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Verificacion fallida" }, { status: 403 })
}

// Handle incoming messages (POST request from Meta)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process incoming messages
    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || []

      for (const entry of entries) {
        const changes = entry.changes || []

        for (const change of changes) {
          if (change.field === "messages") {
            const value = change.value
            const messages = value.messages || []

            for (const message of messages) {
              // Here you would:
              // 1. Store the message in your database
              // 2. Process with AI if needed
              // 3. Send automated response
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
