import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { sendDepositReceived } from "@/lib/whatsapp-notification"
import crypto from "crypto"

export async function POST(request: Request) {
  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 })
  }

  const body = await request.json()

  if (body.type !== "TRANSACTION") {
    return NextResponse.json({ received: true })
  }

  const tx = body.obj
  const { success, order: paymobOrder, amount_cents, currency, id: transactionId } = tx

  const merchantOrderId = paymobOrder?.merchant_order_id
  if (!merchantOrderId) {
    return NextResponse.json({ error: "Missing merchant_order_id" }, { status: 400 })
  }

  const { data: rawOrder } = await supabase
    .from("orders")
    .select("*, stores!inner(owner_id)")
    .eq("id", merchantOrderId)
    .single()

  if (!rawOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const order = rawOrder as unknown as Record<string, unknown>

  const depositAmount = amount_cents / 100

  const txRecord: Record<string, unknown> = {
    store_id: order.store_id,
    order_id: order.id,
    provider: "paymob",
    transaction_id: String(transactionId),
    intention_id: String(paymobOrder?.id ?? ""),
    amount: depositAmount,
    currency: currency || "EGP",
    status: success ? "completed" : "failed",
    type: "deposit",
    provider_response: tx,
  }
  await supabase.from("payment_transactions").insert(txRecord as never)

  if (!success) {
    return NextResponse.json({ received: true, status: "failed" })
  }

  await supabase
    .from("orders")
    .update({
      deposit_paid: true,
      deposit_paid_at: new Date().toISOString(),
      payment_status: "partial",
    } as never)
    .eq("id", order.id as string)

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", order.customer_id as string)
    .single()

  if (customer) {
    const updatedOrder = {
      ...order,
      deposit_amount: depositAmount,
      remaining_amount: Number(order.total as number) - depositAmount,
    } as any

    sendDepositReceived(order.store_id as string, updatedOrder, customer)
  }

  return NextResponse.json({ received: true, status: success ? "completed" : "failed" })
}
