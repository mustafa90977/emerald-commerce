import { type NextRequest, NextResponse } from "next/server"
import { verifyWhatsAppToken } from "@/lib/whatsapp-api"

export async function POST(request: NextRequest) {
  try {
    const { phone_number_id, access_token } = await request.json() as {
      phone_number_id: string
      access_token: string
    }

    if (!phone_number_id || !access_token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const valid = await verifyWhatsAppToken(phone_number_id, access_token)

    return NextResponse.json({
      valid,
      message: valid ? "✅ الاتصال ناجح" : "❌ فشل الاتصال - تأكد من صحة البيانات",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Verification failed", details: String(error) },
      { status: 500 }
    )
  }
}