import { type NextRequest, NextResponse } from "next/server"

const publicPaths = [
  "/", "/store", "/pricing", "/login", "/auth/callback", "/auth/signup", "/auth/logout",
  "/api/auth", "/api/webhooks", "/api/n8n/callback", "/api/whatsapp/verify",
  "/api/webhooks/paymob",
]
const adminPaths = ["/admin"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/" || publicPaths.filter(p => p !== "/").some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const { createServerClient } = await import("@supabase/ssr")

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        const response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (adminPaths.some((p) => pathname.startsWith(p))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin" && profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
