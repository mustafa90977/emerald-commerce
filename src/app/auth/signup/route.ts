import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60)
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.user) {
      const baseSlug = slugify(fullName || email.split("@")[0])
      const slug = `${baseSlug}-${Date.now().toString(36)}`

      const { data: store, error: storeError } = await supabaseAdmin
        .from("stores")
        .insert({
          name: `متجر ${fullName || email.split("@")[0]}`,
          slug,
          owner_id: data.user.id,
          description: `متجر التجارة الإلكترونية`,
        })
        .select("id")
        .single()

      if (storeError) {
        return NextResponse.json({ error: storeError.message }, { status: 500 })
      }

      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "merchant",
        store_id: store.id,
      })

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      await supabaseAdmin.from("subscriptions").insert({
        store_id: store.id,
        plan: "free",
        status: "active",
      })
    }

    return NextResponse.json({ user: data.user })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
