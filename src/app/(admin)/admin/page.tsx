import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Store, ShoppingCart, DollarSign, Users } from "lucide-react"

export const metadata: Metadata = { title: "لوحة المشرف" }
export const dynamic = "force-dynamic"

async function getStats() {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return null

  const [
    { count: totalStores },
    { count: totalOrders },
    { data: revenue },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("stores").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "merchant"),
  ])

  return {
    stores: totalStores ?? 0,
    orders: totalOrders ?? 0,
    revenue: revenue?.reduce((s, o) => s + Number(o.total), 0) ?? 0,
    merchants: totalUsers ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: "المتاجر النشطة", value: stats?.stores.toLocaleString("ar-SA") ?? "---", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "إجمالي الطلبات", value: stats?.orders.toLocaleString("ar-SA") ?? "---", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "الإيرادات", value: stats ? `${stats.revenue.toLocaleString("ar-SA")} ريال` : "---", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "التجار المسجلون", value: stats?.merchants.toLocaleString("ar-SA") ?? "---", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">نظرة عامة</h1>
        <p className="mt-1 text-sm text-on-surface-variant">إحصائيات المنصة</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl border border-outline-variant/50 bg-white p-5 transition-all hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <p className="mt-4 text-2xl font-bold text-on-surface">{card.value}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{card.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
