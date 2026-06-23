import { type NextRequest, NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server-service"
import { triggerN8nWorkflow, buildN8nPayload, N8N_PATHS } from "@/lib/n8n"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse("Verification failed", { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract phone_number_id from Meta payload to identify the merchant
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const metadata = value?.metadata

    // metadata.phone_number_id identifies which WhatsApp number received the message
    const phoneNumberId = metadata?.phone_number_id

    let storeId = "system"

    if (phoneNumberId) {
      // Find which merchant this phone number belongs to
      const supabase = await createServiceSupabaseClient()
      if (supabase) {
        const { data: settings } = await supabase
          .from("whatsapp_settings")
          .select("store_id, phone_number")
          .eq("phone_number_id", phoneNumberId)
          .single()

        if (settings) {
          storeId = settings.store_id
        }
      }
    }

    // Forward to n8n with identified store_id
    const payload = buildN8nPayload("whatsapp.message_received", storeId, {
      raw_payload: body,
      identified_store_id: storeId,
    })

    triggerN8nWorkflow(N8N_PATHS.WHATSAPP_INCOMING, payload)

    return NextResponse.json({ status: "received" })
  } catch {
    return NextResponse.json({ status: "received" })
  }
}