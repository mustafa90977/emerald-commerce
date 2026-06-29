import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { sendDepositReceived } from "@/lib/whatsapp-notification"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch { }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id")
    .eq("id", user.id)
    .single()

  if (!profile?.store_id) {
    return NextResponse.json({ error: "لا يوجد متجر" }, { status: 400 })
  }

  const { order_id, deposit_percentage } = await request.json()

  if (!order_id) {
    return NextResponse.json({ error: "order_id مطلوب" }, { status: 400 })
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .eq("store_id", profile.store_id)
    .single()

  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
  }

  const pct = deposit_percentage ?? order.deposit_percentage ?? 0
  const total = Number(order.total)
  const depositAmount = Math.round((total * pct) / 100 * 100) / 100
  const remaining = Math.round((total - depositAmount) * 100) / 100

  await supabase
    .from("orders")
    .update({
      deposit_percentage: pct,
      deposit_amount: depositAmount,
      remaining_amount: remaining,
      deposit_paid: true,
      deposit_paid_at: new Date().toISOString(),
    })
    .eq("id", order_id)

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", order.customer_id)
    .single()

  if (customer) {
    const updatedOrder = { ...order, deposit_amount: depositAmount, remaining_amount: remaining, deposit_percentage: pct }
    sendDepositReceived(profile.store_id, updatedOrder, customer)
  }

  return NextResponse.json({
    success: true,
    deposit_percentage: pct,
    deposit_amount: depositAmount,
    remaining_amount: remaining,
  })
}
