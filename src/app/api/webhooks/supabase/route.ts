import { type NextRequest, NextResponse } from "next/server"
import { triggerN8nWorkflow, buildN8nPayload, N8N_PATHS } from "@/lib/n8n"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { type, table, record, old_record } = body

    // Map Supabase events to n8n events
    const eventMap: Record<string, Record<string, string>> = {
      orders: {
        INSERT: "order.created",
        UPDATE: "order.updated",
      },
      customers: {
        INSERT: "customer.created",
        UPDATE: "customer.updated",
      },
      products: {
        INSERT: "product.created",
      },
    }

    const event = eventMap[table]?.[type]
    if (!event || !record?.store_id) {
      return NextResponse.json({ ignored: true })
    }

    // Check for deposit_paid change
    if (table === "orders" && type === "UPDATE" && record.deposit_paid && !old_record?.deposit_paid) {
      const depositEvent = "deposit.paid"
      const depositPayload = buildN8nPayload(
        depositEvent as any,
        record.store_id,
        { record, old_record },
        record.store_name
      )
      triggerN8nWorkflow("emerald-deposit-received", depositPayload)
    }

    // Determine which n8n path to call
    let n8nPath: string | undefined
    if (event === "order.created") {
      n8nPath = N8N_PATHS.ORDER_CONFIRMATION
    } else if (event === "customer.created") {
      n8nPath = N8N_PATHS.NEW_CUSTOMER
    }

    const payload = buildN8nPayload(
      event as any,
      record.store_id,
      { record, old_record },
      record.store_name
    )

    if (n8nPath) {
      triggerN8nWorkflow(n8nPath, payload)
    }

    return NextResponse.json({ received: true, event })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process webhook", details: String(error) },
      { status: 500 }
    )
  }
}