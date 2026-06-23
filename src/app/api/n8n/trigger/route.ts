import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { triggerN8nWorkflow } from "@/lib/n8n"
import type { N8nEvent, N8nWebhookPayload } from "@/lib/types"

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase?.auth.getUser() ?? { data: { user: null } }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: {
      event: N8nEvent
      path: string
      data: Record<string, unknown>
      store_name?: string
    } = await request.json()

    // Get user's store_id
    const { data: profile } = await supabase!
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single()

    if (!profile?.store_id) {
      return NextResponse.json({ error: "No store found" }, { status: 404 })
    }

    const payload: N8nWebhookPayload = {
      event: body.event,
      store_id: profile.store_id,
      store_name: body.store_name,
      timestamp: new Date().toISOString(),
      data: body.data,
    }

    // Fire the n8n workflow
    const result = await triggerN8nWorkflow(body.path, payload)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to trigger workflow", details: String(error) },
      { status: 500 }
    )
  }
}