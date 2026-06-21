import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return NextResponse.json({ error: "No Supabase" }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { merchantId } = await request.json()
  if (!merchantId) return NextResponse.json({ error: "merchantId required" }, { status: 400 })

  const { data: store } = await supabase.from("stores").select("id, is_active").eq("owner_id", merchantId).single()
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

  const newStatus = !store.is_active
  await supabase.from("stores").update({ is_active: newStatus }).eq("id", store.id)

  return NextResponse.json({ is_active: newStatus })
}
