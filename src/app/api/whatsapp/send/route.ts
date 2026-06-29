import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { sendTextMessage, sendTemplateMessage, replaceTemplateVariables } from "@/lib/whatsapp-api"

export async function POST(request: NextRequest) {
  const N8N_API_KEY = process.env.N8N_API_KEY

  const authHeader = request.headers.get("authorization") || ""
  const isN8n = N8N_API_KEY && authHeader === `Bearer ${N8N_API_KEY}`

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  let storeId: string | null = null

  if (isN8n) {
    storeId = body.store_id as string
    if (!storeId) {
      return NextResponse.json({ error: "store_id required" }, { status: 400 })
    }
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase?.auth.getUser() ?? { data: { user: null } }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase!
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .single()

    if (!profile?.store_id && profile?.role === "merchant") {
      return NextResponse.json({ error: "No store found" }, { status: 404 })
    }

    storeId = (body.store_id || profile?.store_id) as string
    if (!storeId) {
      return NextResponse.json({ error: "store_id required" }, { status: 400 })
    }
  }

  if (!storeId) {
    return NextResponse.json({ error: "store_id required" }, { status: 400 })
  }

  try {
    const { to, message, template_name, components } = body as {
      to: string
      message?: string
      template_name?: string
      components?: Record<string, unknown>[]
    }

    const admin = getAdminClient()
    if (!admin) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    const { data: settings } = await admin
      .from("whatsapp_settings")
      .select("*")
      .eq("store_id", storeId)
      .single()

    if (!settings?.is_connected || !settings.phone_number_id || !settings.access_token) {
      return NextResponse.json(
        { error: "WhatsApp not connected. Please connect your WhatsApp number in settings." },
        { status: 400 }
      )
    }

    let result: any = null

    if (template_name) {
      result = await sendTemplateMessage({
        phoneNumberId: settings.phone_number_id,
        accessToken: settings.access_token,
        to,
        templateName: template_name,
        components,
      })
    } else if (message) {
      const msg = replaceTemplateVariables(message, {
        store_name: body.store_name || "",
        customer_name: body.customer_name || "",
      })

      result = await sendTextMessage({
        phoneNumberId: settings.phone_number_id,
        accessToken: settings.access_token,
        to,
        text: msg,
      })
    }

    if (result) {
      const waMessageId = result?.messages?.[0]?.id
      await admin
        .from("whatsapp_messages")
        .insert({
          store_id: storeId,
          order_id: body.order_id || null,
          customer_id: body.customer_id || null,
          direction: "outbound",
          message_type: template_name ? "template" : "text",
          content: message || template_name || "",
          template_name: template_name || null,
          wa_message_id: waMessageId || null,
          status: "sent",
        })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message", details: String(error) },
      { status: 500 }
    )
  }
}
