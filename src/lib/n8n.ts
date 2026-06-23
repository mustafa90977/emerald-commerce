import type { N8nEvent, N8nWebhookPayload } from "./types"

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const N8N_API_KEY = process.env.N8N_API_KEY

export async function triggerN8nWorkflow(
  path: string,
  payload: N8nWebhookPayload
) {
  if (!N8N_WEBHOOK_URL) {
    console.warn("[n8n] N8N_WEBHOOK_URL not configured")
    return null
  }

  const url = `${N8N_WEBHOOK_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(N8N_API_KEY ? { Authorization: `Bearer ${N8N_API_KEY}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(`[n8n] Workflow ${path} failed: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error(`[n8n] Error triggering ${path}:`, error)
    return null
  }
}

export function buildN8nPayload(
  event: N8nEvent,
  storeId: string,
  data: Record<string, unknown>,
  storeName?: string
): N8nWebhookPayload {
  return {
    event,
    store_id: storeId,
    store_name: storeName,
    timestamp: new Date().toISOString(),
    data,
  }
}

export const N8N_PATHS = {
  ORDER_CONFIRMATION: "emerald-order-confirmation",
  NEW_CUSTOMER: "emerald-new-customer",
  WHATSAPP_INCOMING: "emerald-whatsapp-incoming",
} as const