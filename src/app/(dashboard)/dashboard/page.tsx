import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react"

export const metadata: Metadata = {
  title: "لوحة التحكم",
}

export const dynamic = "force-dynamic"

async function getStats() {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id")
    .eq("id", user.id)
    .single()

  if (!profile?.store_id) return null

  const storeId = profile.store_id

  const [{ count: totalOrders }, { data: fullyPaid }, { data: depositsPaid }, { count: totalCustomers }, { count: totalProducts }] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", storeId),
      supabase.from("orders").select("total").eq("store_id", storeId).eq("payment_status", "paid"),
      supabase.from("orders").select("deposit_amount").eq("store_id", storeId).eq("deposit_paid", true).neq("payment_status", "paid"),
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("store_id", storeId),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", storeId).eq("is_active", true),
    ])

  const fullRevenue = fullyPaid?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0
  const depositRevenue = depositsPaid?.reduce((sum, o) => sum + Number(o.deposit_amount), 0) ?? 0
  const revenue = fullRevenue + depositRevenue

  return {
    totalOrders: totalOrders ?? 0,
    totalRevenue: revenue,
    totalCustomers: totalCustomers ?? 0,
    totalProducts: totalProducts ?? 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: "إجمالي المبيعات", value: stats ? `${stats.totalRevenue.toLocaleString("ar-SA")} ريال` : "---", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "إجمالي الطلبات", value: stats?.totalOrders.toLocaleString("ar-SA") ?? "---", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "العملاء", value: stats?.totalCustomers.toLocaleString("ar-SA") ?? "---", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "المنتجات", value: stats?.totalProducts.toLocaleString("ar-SA") ?? "---", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">نظرة عامة</h1>
        <p className="mt-1 text-sm text-on-surface-variant">مرحباً بك في لوحة التحكم</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-outline-variant/50 bg-surface p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
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
