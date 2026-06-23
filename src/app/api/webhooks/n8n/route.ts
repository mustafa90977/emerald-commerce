import { type NextRequest, NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server-service"

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createServiceSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()

    const {
      event,
      store_id,
      order_id,
      customer_id,
      wa_message_id,
      status,
      metadata,
    } = body

    switch (event) {
      case "message.status": {
        if (store_id && wa_message_id) {
          await supabase
            .from("whatsapp_messages")
            .update({ status, metadata })
            .eq("wa_message_id", wa_message_id)
        }
        break
      }

      case "order.updated": {
        if (store_id && order_id) {
          await supabase
            .from("orders")
            .update(metadata?.updates ?? {})
            .eq("id", order_id)
            .eq("store_id", store_id)
        }
        break
      }

      case "customer.response": {
        if (store_id && customer_id && body.message) {
          await supabase
            .from("whatsapp_messages")
            .insert({
              store_id,
              customer_id,
              direction: "inbound",
              message_type: "text",
              content: body.message,
              wa_message_id,
              status: "delivered",
            })
        }
        break
      }

      default:
        if (store_id) {
          await supabase
            .from("n8n_executions")
            .insert({
              store_id,
              workflow_name: body.workflow_name ?? "unknown",
              event: event ?? "unknown",
              payload: body,
              status: "success",
            })
        }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process callback", details: String(error) },
      { status: 500 }
    )
  }
}