export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "")
  if (cleaned.startsWith("+966")) return cleaned
  if (cleaned.startsWith("966")) return `+${cleaned}`
  if (cleaned.startsWith("0")) return `+966${cleaned.slice(1)}`
  if (cleaned.startsWith("5")) return `+966${cleaned}`
  return cleaned
}

export function buildWhatsAppUrl(phone: string, text?: string): string {
  const formatted = formatPhoneNumber(phone)
  const params = new URLSearchParams()
  if (text) params.set("text", text)
  return `https://wa.me/${formatted.replace(/^\+/, "")}${params.toString() ? `?${params.toString()}` : ""}`
}

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), String(value))
  }
  return result
}

export const WELCOME_MESSAGE = `السلام عليكم {{customer_name}} 👋

مرحباً بك في {{store_name}}! 🎉

نحن سعداء بانضمامك إلينا. يمكنك تصفح منتجاتنا وطلب ما يعجبك عبر واتساب.

لأي استفسار، نحن هنا لخدمتك 24/7 💚`

export const ORDER_CONFIRMATION_MESSAGE = `السلام عليكم {{customer_name}} 👋

تم استلام طلبك رقم {{order_number}} بنجاح ✅

📋 تفاصيل الطلب:
{{order_items}}

💰 المجموع: {{order_total}} ريال
📦 الحالة: قيد المراجعة

سنقوم بتحديثك بأي مستجدات. شكراً لتسوقك معنا! 🙏`

export const ORDER_SHIPPED_MESSAGE = `السلام عليكم {{customer_name}} 👋

تم شحن طلبك رقم {{order_number}} 🚚

📦 من المتوقع وصوله خلال {{delivery_days}} أيام عمل.

يمكنك تتبع طلبك عبر الرابط:
{{tracking_url}}

شكراً لاختيارك لنا! 💚`