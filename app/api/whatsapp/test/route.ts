import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumberId, accessToken } = await request.json()

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    // Test the connection by fetching the phone number details
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] WhatsApp connection test failed:", data)
      return NextResponse.json({ error: data.error?.message || "Connection failed" }, { status: response.status })
    }

    console.log("[v0] WhatsApp connection test successful:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Test connection error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
