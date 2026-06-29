import { type NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmation, sendDepositReceived, sendCustomerWelcome } from "@/lib/whatsapp-notification"
import { getAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, table, record, old_record } = body

    if (!record?.store_id) {
      return NextResponse.json({ ignored: true })
    }

    const supabase = getAdminClient()

    if (table === "orders" && type === "INSERT") {
      const { data: customer } = await supabase!
        .from("customers")
        .select("*")
        .eq("id", record.customer_id)
        .single()

      if (customer) {
        sendOrderConfirmation(record.store_id, record, customer)
      }
    }

    if (table === "orders" && type === "UPDATE" && record.deposit_paid && !old_record?.deposit_paid) {
      const { data: customer } = await supabase!
        .from("customers")
        .select("*")
        .eq("id", record.customer_id)
        .single()

      if (customer) {
        sendDepositReceived(record.store_id, record, customer)
      }
    }

    if (table === "customers" && type === "INSERT") {
      sendCustomerWelcome(record.store_id, record)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process webhook", details: String(error) },
      { status: 500 }
    )
  }
}
