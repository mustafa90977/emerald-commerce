const META_API_VERSION = "v21.0"
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`

export interface SendTextMessageParams {
  phoneNumberId: string
  accessToken: string
  to: string
  text: string
  previewUrl?: boolean
}

export interface SendTemplateMessageParams {
  phoneNumberId: string
  accessToken: string
  to: string
  templateName: string
  language?: string
  components?: Record<string, unknown>[]
}

export interface WhatsAppApiResponse {
  messaging_product: string
  contacts: { input: string; wa_id: string }[]
  messages: { id: string }[]
}

export async function sendTextMessage(
  params: SendTextMessageParams
): Promise<WhatsAppApiResponse | null> {
  const { phoneNumberId, accessToken, to, text, previewUrl = false } = params

  try {
    const res = await fetch(`${META_GRAPH_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text, preview_url: previewUrl },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[WhatsApp API] send failed:", err)
      return null
    }

    return res.json()
  } catch (error) {
    console.error("[WhatsApp API] error:", error)
    return null
  }
}

export async function sendTemplateMessage(
  params: SendTemplateMessageParams
): Promise<WhatsAppApiResponse | null> {
  const { phoneNumberId, accessToken, to, templateName, language = "ar", components } = params

  try {
    const body: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
      },
    }

    if (components) {
      body.template = { ...body.template as Record<string, unknown>, components }
    }

    const res = await fetch(`${META_GRAPH_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[WhatsApp API] template send failed:", err)
      return null
    }

    return res.json()
  } catch (error) {
    console.error("[WhatsApp API] error:", error)
    return null
  }
}

export async function registerWhatsAppWebhook(
  phoneNumberId: string,
  accessToken: string,
  webhookUrl: string,
  verifyToken: string
) {
  try {
    const res = await fetch(`${META_GRAPH_URL}/${phoneNumberId}/subscribed_apps`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed_fields: ["messages", "message_deliveries", "message_reads"],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[WhatsApp API] webhook register failed:", err)
      return null
    }

    return res.json()
  } catch (error) {
    console.error("[WhatsApp API] error:", error)
    return null
  }
}

export async function verifyWhatsAppToken(
  phoneNumberId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const res = await fetch(`${META_GRAPH_URL}/${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res.ok
  } catch {
    return false
  }
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

export async function markMessageAsRead(
  phoneNumberId: string,
  accessToken: string,
  messageId: string
) {
  try {
    await fetch(`${META_GRAPH_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    })
  } catch {
    // fire-and-forget
  }
}