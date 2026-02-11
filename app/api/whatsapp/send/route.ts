import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, message, phoneNumberId, accessToken } = await request.json()

    if (!to || !message || !phoneNumberId || !accessToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] WhatsApp API error:", data)
      return NextResponse.json({ error: data.error?.message || "Failed to send message" }, { status: response.status })
    }

    console.log("[v0] Message sent successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Send message error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
