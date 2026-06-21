import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return NextResponse.json({ error: "No Supabase" }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data } = await supabase.from("platform_settings").select("key, value")
  const settings: Record<string, string> = {}
  data?.forEach((s) => { settings[s.key] = s.value })

  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return NextResponse.json({ error: "No Supabase" }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body: Record<string, string> = await request.json()

  for (const [key, value] of Object.entries(body)) {
    await supabase.from("platform_settings").upsert({ key, value }, { onConflict: "key" })
  }

  return NextResponse.json({ success: true })
}
