import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { triggerN8nWorkflow, buildN8nPayload } from "@/lib/n8n"
import { N8N_EVENTS } from "@/lib/constants"
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

  const { data: store } = await supabase
    .from("stores")
    .select("name")
    .eq("id", order.store_id as string)
    .single()

  const storeName = (store as unknown as { name?: string } | null)?.name

  triggerN8nWorkflow("emerald-deposit-received", buildN8nPayload(
    N8N_EVENTS.DEPOSIT_PAID,
    order.store_id as string,
    {
      order_id: order.id,
      order_number: order.order_number,
      deposit_amount: depositAmount,
      transaction_id: transactionId,
    },
    storeName
  ))

  return NextResponse.json({ received: true, status: success ? "completed" : "failed" })
}
