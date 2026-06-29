import { getAdminClient } from "./supabase/admin"
import { sendTextMessage } from "./whatsapp-api"

interface OrderData {
  id: string
  order_number?: string
  total: number
  store_id: string
  customer_id: string
  items?: { name: string; quantity: number; price: number }[]
  deposit_amount?: number
  deposit_percentage?: number
  remaining_amount?: number
}

interface CustomerData {
  id: string
  name?: string
  phone: string
  store_id?: string
}

async function getWhatsAppSettings(storeId: string) {
  const supabase = getAdminClient()
  if (!supabase) return null

  const { data } = await supabase
    .from("whatsapp_settings")
    .select("*")
    .eq("store_id", storeId)
    .single()

  return data
}

async function logMessage(params: {
  storeId: string
  orderId?: string
  customerId?: string
  content: string
  waMessageId?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = getAdminClient()
  if (!supabase) return

  await supabase.from("whatsapp_messages").insert({
    store_id: params.storeId,
    order_id: params.orderId || null,
    customer_id: params.customerId || null,
    direction: "outbound",
    message_type: "text",
    content: params.content,
    wa_message_id: params.waMessageId || null,
    status: params.waMessageId ? "sent" : "failed",
    metadata: params.metadata || null,
  })
}

export async function sendOrderConfirmation(
  storeId: string,
  order: OrderData,
  customer: CustomerData
) {
  const settings = await getWhatsAppSettings(storeId)
  if (!settings?.is_connected || !settings.phone_number_id || !settings.access_token) {
    console.warn(`[whatsapp-notification] Store ${storeId} not connected`)
    return null
  }

  const customerName = customer.name || "عميلنا العزيز"
  const orderNumber = order.order_number || ""

  const itemsList = (order.items || [])
    .map((item) => `- ${item.name} (×${item.quantity}) = ${(item.price * item.quantity).toFixed(2)} ريال`)
    .join("\n")

  const message = `السلام عليكم ${customerName} 👋\n\n` +
    `تم استلام طلبك رقم ${orderNumber} بنجاح ✅\n\n` +
    `📋 **تفاصيل الطلب:**\n${itemsList}\n\n` +
    `💰 **المجموع:** ${Number(order.total).toFixed(2)} ريال\n\n` +
    `سنقوم بتحديثك بأي مستجدات. شكراً لتسوقك معنا! 🙏`

  const result = await sendTextMessage({
    phoneNumberId: settings.phone_number_id,
    accessToken: settings.access_token,
    to: customer.phone,
    text: message,
  })

  const waMessageId = result?.messages?.[0]?.id
  await logMessage({
    storeId,
    orderId: order.id,
    customerId: customer.id,
    content: message,
    waMessageId,
    metadata: { type: "order_confirmation", order_number: orderNumber },
  })

  return result
}

export async function sendDepositReceived(
  storeId: string,
  order: OrderData,
  customer: CustomerData
) {
  const settings = await getWhatsAppSettings(storeId)
  if (!settings?.is_connected || !settings.phone_number_id || !settings.access_token) {
    console.warn(`[whatsapp-notification] Store ${storeId} not connected`)
    return null
  }

  const customerName = customer.name || "عميلنا العزيز"
  const orderNumber = order.order_number || ""
  const depositAmount = Number(order.deposit_amount || 0).toFixed(2)
  const remainingAmount = Number(order.remaining_amount || order.total - Number(order.deposit_amount || 0)).toFixed(2)

  const message = `السلام عليكم ${customerName} 👋\n\n` +
    `تم استلام الدفعة المقدمة لطلبك رقم ${orderNumber} ✅\n\n` +
    `💰 **المبلغ المستلم:** ${depositAmount} ريال\n` +
    `📋 **المتبقي:** ${remainingAmount} ريال\n\n` +
    `سيتم تجهيز طلبك وشحنه قريباً. سنقوم بتحديثك بأي مستجدات 🚚\n\n` +
    `شكراً لثقتك بنا! 💚`

  const result = await sendTextMessage({
    phoneNumberId: settings.phone_number_id,
    accessToken: settings.access_token,
    to: customer.phone,
    text: message,
  })

  const waMessageId = result?.messages?.[0]?.id
  await logMessage({
    storeId,
    orderId: order.id,
    customerId: customer.id,
    content: message,
    waMessageId,
    metadata: { type: "deposit_received", deposit_amount: depositAmount },
  })

  return result
}

export async function sendCustomerWelcome(
  storeId: string,
  customer: CustomerData
) {
  const settings = await getWhatsAppSettings(storeId)
  if (!settings?.is_connected || !settings.phone_number_id || !settings.access_token) {
    console.warn(`[whatsapp-notification] Store ${storeId} not connected`)
    return null
  }

  const customerName = customer.name || "عميلنا العزيز"
  const storeName = settings.store_name || settings.name || "المتجر"

  const welcomeMessage = settings.welcome_message ||
    `السلام عليكم ${customerName} 👋\n\n` +
    `مرحباً بك في ${storeName}! 🎉\n\n` +
    `نحن سعداء بانضمامك إلينا. يمكنك تصفح منتجاتنا وطلب ما يعجبك عبر واتساب.\n\n` +
    `للاستفسار، نحن هنا لخدمتك 💚`

  const message = welcomeMessage
    .replace("{{customer_name}}", customerName)
    .replace("{{store_name}}", storeName)

  const result = await sendTextMessage({
    phoneNumberId: settings.phone_number_id,
    accessToken: settings.access_token,
    to: customer.phone,
    text: message,
  })

  const waMessageId = result?.messages?.[0]?.id
  await logMessage({
    storeId,
    customerId: customer.id,
    content: message,
    waMessageId,
    metadata: { type: "customer_welcome" },
  })

  return result
}
