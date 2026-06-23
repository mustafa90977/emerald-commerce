import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { registerWhatsAppWebhook } from "@/lib/whatsapp-api"

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase?.auth.getUser() ?? { data: { user: null } }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase!
    .from("profiles")
    .select("store_id")
    .eq("id", user.id)
    .single()

  if (!profile?.store_id) {
    return NextResponse.json({ error: "No store found" }, { status: 404 })
  }

  try {
    const { phone_number_id, access_token, phone_number } = await request.json() as {
      phone_number_id: string
      access_token: string
      phone_number: string
    }

    if (!phone_number_id || !access_token || !phone_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Try to subscribe the app to this phone number
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/webhooks/whatsapp`
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "emerald-whatsapp-verify"

    const subResult = await registerWhatsAppWebhook(phone_number_id, access_token, webhookUrl, verifyToken)

    // Save settings to database (upsert)
    const { error: dbError } = await supabase!
      .from("whatsapp_settings")
      .upsert({
        store_id: profile.store_id,
        phone_number,
        phone_number_id,
        access_token,
        webhook_verify_token: verifyToken,
        is_connected: !!subResult,
      }, { onConflict: "store_id" })

    if (dbError) {
      return NextResponse.json({ error: "Database error", details: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      connected: !!subResult,
      message: subResult
        ? "تم ربط رقم واتساب بنجاح ✅"
        : "تم حفظ الإعدادات، لكن تعذر الاشتراك في webhook. قد تحتاج لتسجيله يدوياً.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to register webhook", details: String(error) },
      { status: 500 }
    )
  }
}