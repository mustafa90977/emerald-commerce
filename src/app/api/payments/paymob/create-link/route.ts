import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getAdminClient } from "@/lib/supabase/admin"

const PAYMOB_BASE_URL = "https://accept.paymob.com"

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

  const { order_id, amount, customer_name, customer_email, customer_phone } = await request.json()

  if (!order_id || !amount) {
    return NextResponse.json({ error: "order_id و amount مطلوبان" }, { status: 400 })
  }

  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 })
  }

  const { data: gateway } = await adminClient
    .from("payment_gateways")
    .select("settings")
    .eq("store_id", profile.store_id)
    .eq("provider", "paymob")
    .eq("is_active", true)
    .single()

  if (!gateway) {
    return NextResponse.json({ error: "بوابة الدفع غير مفعلة. أضف إعدادات Paymob في الإعدادات." }, { status: 400 })
  }

  const gatewayData = gateway as unknown as { settings: Record<string, unknown> }
  const settings = gatewayData.settings
  const secretKey = settings.secret_key as string
  const integrationId = settings.integration_id as number
  const currency = (settings.currency as string) || "EGP"

  if (!secretKey || !integrationId) {
    return NextResponse.json({ error: "بيانات Paymob غير مكتملة" }, { status: 400 })
  }

  const amountCents = Math.round(amount * 100)

  const intentionBody = {
    amount: amountCents,
    currency,
    payment_methods: [integrationId],
    items: [{ name: `دفعة مقدمة طلب #${order_id.slice(0, 8)}`, amount: amountCents, quantity: 1 }],
    billing_data: {
      first_name: customer_name?.split(" ")[0] || "عميل",
      last_name: customer_name?.split(" ").slice(1).join(" ") || "",
      email: customer_email || "customer@example.com",
      phone_number: customer_phone || "0000000000",
      country: currency === "EGP" ? "EG" : currency === "SAR" ? "SA" : "AE",
    },
    special_reference: order_id,
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://emerald-commerce-n7upuxutr-mustafa90977s-projects.vercel.app"}/api/webhooks/paymob`,
    redirection_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/orders/${order_id}`,
  }

  try {
    const paymobRes = await fetch(`${PAYMOB_BASE_URL}/v1/intention/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${secretKey}`,
      },
      body: JSON.stringify(intentionBody),
    })

    const paymobData = await paymobRes.json()

    if (!paymobRes.ok) {
      return NextResponse.json({
        error: "فشل إنشاء رابط الدفع",
        details: paymobData,
      }, { status: 400 })
    }

    const { data: pgData } = await adminClient
      .from("payment_gateways")
      .select("settings")
      .eq("store_id", profile.store_id)
      .eq("provider", "paymob")
      .single()

    const pgSettings = (pgData as unknown as { settings: Record<string, unknown> } | null)?.settings
    const publicKey = (pgSettings?.public_key as string) || ""
    const checkoutUrl = `${PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${paymobData.client_secret}`

    await adminClient.from("payment_transactions").insert({
      store_id: profile.store_id,
      order_id,
      provider: "paymob",
      intention_id: paymobData.id,
      amount,
      currency,
      status: "pending",
      type: "deposit",
    } as never)

    return NextResponse.json({
      success: true,
      payment_link_url: checkoutUrl,
      client_secret: paymobData.client_secret,
      intention_id: paymobData.id,
    })
  } catch (err) {
    return NextResponse.json({ error: "فشل الاتصال بـ Paymob", details: String(err) }, { status: 500 })
  }
}
