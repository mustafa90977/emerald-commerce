"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { exportCSV } from "@/lib/csv"
import type { TicketStatus, TicketPriority, OrderStatus } from "@/lib/types"
import {
  LayoutDashboard, Store, HeadphonesIcon, History, Settings,
  Search, Loader2, ToggleRight, ToggleLeft, Send, ShoppingCart, DollarSign, Users as UsersIcon,
  Package, Plus, X, ChevronLeft, ChevronRight, Download, Edit3, Trash2,
} from "lucide-react"

const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "merchants", label: "التجار", icon: Store },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "orders", label: "الطلبات", icon: ShoppingCart },
  { id: "support", label: "الدعم الفني", icon: HeadphonesIcon },
  { id: "audit", label: "سجل العمليات", icon: History },
  { id: "settings", label: "الإعدادات", icon: Settings },
]

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-50 text-blue-700", in_progress: "bg-purple-50 text-purple-700",
  waiting: "bg-yellow-50 text-yellow-700", resolved: "bg-emerald-50 text-emerald-700", closed: "bg-gray-50 text-gray-500",
}
const priorityColors: Record<TicketPriority, string> = {
  low: "bg-surface-container text-on-surface-variant", medium: "bg-yellow-50 text-yellow-700",
  high: "bg-orange-50 text-orange-700", urgent: "bg-red-50 text-red-700",
}

const PAGE_SIZE = 10

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-on-surface-variant border border-outline-variant/50 hover:border-primary/30 hover:text-primary"
              )}>
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "overview" && <OverviewTab supabase={supabase} />}
      {activeTab === "merchants" && <MerchantsTab supabase={supabase} />}
      {activeTab === "products" && <ProductsTab supabase={supabase} />}
      {activeTab === "orders" && <OrdersTab supabase={supabase} />}
      {activeTab === "support" && <SupportTab supabase={supabase} />}
      {activeTab === "audit" && <AuditTab supabase={supabase} />}
      {activeTab === "settings" && <SettingsTab />}
    </div>
  )
}

function OverviewTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [stats, setStats] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    if (!supabase) return; (async () => {
      const [{ count: stores }, { count: orders }, { data: revenue }, { count: merchants }] = await Promise.all([
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("payment_status", "paid"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "merchant"),
      ])
      setStats({
        stores: stores ?? 0, orders: orders ?? 0,
        revenue: revenue?.reduce((s, o) => s + Number(o.total), 0) ?? 0, merchants: merchants ?? 0,
      })
    })()
  }, [supabase])

  const cards = [
    { label: "المتاجر النشطة", value: stats?.stores.toLocaleString("ar-SA") ?? "---", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "إجمالي الطلبات", value: stats?.orders.toLocaleString("ar-SA") ?? "---", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "الإيرادات", value: stats ? `${stats.revenue.toLocaleString("ar-SA")} ريال` : "---", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "التجار المسجلون", value: stats?.merchants.toLocaleString("ar-SA") ?? "---", icon: UsersIcon, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div>
      <div className="mb-6">
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

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{total} نتيجة</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="rounded-lg border border-outline-variant/50 p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
        <span className="text-on-surface-variant">{page} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="rounded-lg border border-outline-variant/50 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

interface Merchant {
  id: string; full_name: string; email: string; role: string; created_at: string
  store: { id: string; name: string; is_active: boolean } | null
}

function MerchantsTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return; (async () => {
      let q = supabase.from("profiles")
        .select("id, full_name, email, role, created_at, store:stores(id, name, is_active)", { count: "exact" })
        .eq("role", "merchant").order("created_at", { ascending: false })
      if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      const { data, count } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      setMerchants((data as unknown as Merchant[]) ?? []); setLoading(false)
    })()
  }, [search, page, supabase])

  async function toggleMerchant(id: string) {
    if (!supabase) return; setToggling(id)
    await fetch("/api/admin/merchants/toggle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId: id }),
    })
    setToggling(null)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-on-surface">التجار</h1><p className="text-sm text-on-surface-variant">إدارة جميع التجار المسجلين</p></div>
        <button onClick={() => exportCSV(["الاسم", "البريد", "المتجر", "الحالة", "تاريخ التسجيل"],
          merchants.map((m) => [m.full_name || "", m.email, m.store?.name || "", m.store?.is_active ? "نشط" : "موقوف", new Date(m.created_at).toLocaleDateString("ar-SA")]),
          "التجار.csv")}
          className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"><Download className="h-4 w-4" />تصدير</button>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="بحث باسم التاجر أو البريد..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        merchants.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا يوجد تجار</p> :
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-outline-variant/50 bg-white md:block">
            <table className="w-full">
              <thead><tr className="border-b border-outline-variant/50 bg-surface-container/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التاجر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المتجر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-on-surface-variant">تحكم</th>
              </tr></thead>
              <tbody>{merchants.map((m) => (
                <tr key={m.id} className="border-b border-outline-variant/30 hover:bg-surface-container/30">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-on-surface">{m.full_name || "---"}</p>
                    <p className="text-xs text-on-surface-variant" dir="ltr">{m.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{m.store?.name ?? "---"}</td>
                  <td className="px-6 py-4">
                    <span className={cn("flex items-center gap-1.5 text-sm", m.store?.is_active ? "text-emerald-600" : "text-red-500")}>
                      {m.store?.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {m.store?.is_active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(m.created_at).toLocaleDateString("ar-SA")}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleMerchant(m.id)} disabled={toggling === m.id}
                      className={cn("rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                        m.store?.is_active
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50")}>
                      {toggling === m.id ? "..." : m.store?.is_active ? "إيقاف" : "تفعيل"}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {merchants.map((m) => (
              <div key={m.id} className="rounded-2xl border border-outline-variant/50 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{m.full_name || "---"}</p>
                    <p className="text-xs text-on-surface-variant" dir="ltr">{m.email}</p>
                  </div>
                  <button onClick={() => toggleMerchant(m.id)} disabled={toggling === m.id}
                    className={cn("rounded-lg border px-3 py-1 text-xs font-medium shrink-0",
                      m.store?.is_active
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50")}>
                    {toggling === m.id ? "..." : m.store?.is_active ? "إيقاف" : "تفعيل"}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">{m.store?.name ?? "بدون متجر"}</span>
                  <span className={cn("flex items-center gap-1 text-xs", m.store?.is_active ? "text-emerald-600" : "text-red-500")}>
                    {m.store?.is_active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                    {m.store?.is_active ? "نشط" : "موقوف"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">{new Date(m.created_at).toLocaleDateString("ar-SA")}</p>
              </div>
            ))}
          </div>
          <Pagination page={page} total={merchants.length} onChange={setPage} />
        </>
      }
    </div>
  )
}

function ProductsTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; stock: number; category: string; is_active: boolean; created_at: string; store: { name: string } | null }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!supabase) return; (async () => {
      let q = supabase.from("products").select("id, name, price, stock, category, is_active, created_at, store:stores(name)").order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (search) q = q.ilike("name", `%${search}%`)
      const { data } = await q
      setProducts((data as unknown as typeof products) ?? []); setLoading(false)
    })()
  }, [search, page, supabase])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-on-surface">المنتجات</h1><p className="text-sm text-on-surface-variant">جميع منتجات المنصة</p></div>
        <button onClick={() => exportCSV(["المنتج", "السعر", "المخزون", "التصنيف", "الحالة"],
          products.map((p) => [p.name, String(p.price), String(p.stock), p.category || "", p.is_active ? "نشط" : "غير نشط"]),
          "المنتجات.csv")}
          className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"><Download className="h-4 w-4" />تصدير</button>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="بحث عن منتج..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        products.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا توجد منتجات</p> :
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-outline-variant/50 bg-white md:block">
            <table className="w-full">
              <thead><tr className="border-b border-outline-variant/50 bg-surface-container/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المنتج</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المتجر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">السعر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المخزون</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التصنيف</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الحالة</th>
              </tr></thead>
              <tbody>{products.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-container/30">
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{p.store?.name ?? "---"}</td>
                  <td className="px-6 py-4 text-sm text-on-surface">{p.price.toLocaleString("ar-SA")} ريال</td>
                  <td className="px-6 py-4 text-sm"><span className={p.stock > 0 ? "text-on-surface" : "text-red-500"}>{p.stock}</span></td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{p.category || "---"}</td>
                  <td className="px-6 py-4"><span className={cn("rounded-lg px-2 py-0.5 text-xs", p.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500")}>{p.is_active ? "نشط" : "غير نشط"}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-outline-variant/50 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-on-surface">{p.name}</p>
                  <span className={cn("rounded-lg px-2 py-0.5 text-xs", p.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500")}>
                    {p.is_active ? "نشط" : "غير نشط"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-on-surface-variant">{p.store?.name ?? "---"}</div>
                <div className="mt-2 grid grid-cols-3 gap-4 border-t border-outline-variant/30 pt-2 text-center text-sm">
                  <div>
                    <p className="font-medium text-on-surface">{p.price.toLocaleString("ar-SA")} ريال</p>
                    <p className="text-xs text-on-surface-variant">السعر</p>
                  </div>
                  <div>
                    <p className={cn("font-medium", p.stock > 0 ? "text-on-surface" : "text-red-500")}>{p.stock}</p>
                    <p className="text-xs text-on-surface-variant">المخزون</p>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface truncate">{p.category || "---"}</p>
                    <p className="text-xs text-on-surface-variant">التصنيف</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={products.length} onChange={setPage} />
        </>
      }
    </div>
  )
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التوصيل", cancelled: "ملغي",
}
const orderStatusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700", confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-purple-50 text-purple-700", shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-50 text-emerald-700", cancelled: "bg-red-50 text-red-700",
}

function OrdersTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [orders, setOrders] = useState<Array<{ id: string; order_number: string; total: number; status: OrderStatus; payment_status: string; created_at: string; store: { name: string } | null }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!supabase) return; (async () => {
      let q = supabase.from("orders").select("id, order_number, total, status, payment_status, created_at, store:stores(name)").order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (search) q = q.ilike("order_number", `%${search}%`)
      const { data } = await q
      setOrders((data as unknown as typeof orders) ?? []); setLoading(false)
    })()
  }, [search, page, supabase])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-on-surface">الطلبات</h1><p className="text-sm text-on-surface-variant">جميع طلبات المنصة</p></div>
        <button onClick={() => exportCSV(["رقم الطلب", "المتجر", "المجموع", "الحالة", "التاريخ"],
          orders.map((o) => [o.order_number, o.store?.name || "", String(o.total), orderStatusLabels[o.status], new Date(o.created_at).toLocaleDateString("ar-SA")]),
          "الطلبات.csv")}
          className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"><Download className="h-4 w-4" />تصدير</button>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="بحث برقم الطلب..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        orders.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا توجد طلبات</p> :
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-outline-variant/50 bg-white md:block">
            <table className="w-full">
              <thead><tr className="border-b border-outline-variant/50 bg-surface-container/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">رقم الطلب</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المتجر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المجموع</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الدفع</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التاريخ</th>
              </tr></thead>
              <tbody>{orders.map((o) => (
                <tr key={o.id} className="border-b border-outline-variant/30 hover:bg-surface-container/30">
                  <td className="px-6 py-4 text-sm font-medium text-on-surface" dir="ltr">{o.order_number}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{o.store?.name ?? "---"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{o.total.toLocaleString("ar-SA")} ريال</td>
                  <td className="px-6 py-4"><span className={cn("rounded-lg px-2 py-0.5 text-xs", orderStatusColors[o.status])}>{orderStatusLabels[o.status]}</span></td>
                  <td className="px-6 py-4"><span className={cn("rounded-lg px-2 py-0.5 text-xs capitalize", o.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700")}>{o.payment_status}</span></td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(o.created_at).toLocaleDateString("ar-SA")}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-outline-variant/50 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface" dir="ltr">{o.order_number}</span>
                  <span className={cn("rounded-lg px-2 py-0.5 text-xs", orderStatusColors[o.status])}>{orderStatusLabels[o.status]}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-on-surface-variant">{o.store?.name ?? "---"}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(o.created_at).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">{o.total.toLocaleString("ar-SA")} ريال</p>
                    <span className={cn("rounded-lg px-2 py-0.5 text-xs", o.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700")}>
                      {o.payment_status === "paid" ? "مدفوع" : "غير مدفوع"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={orders.length} onChange={setPage} />
        </>
      }
    </div>
  )
}

interface Ticket {
  id: string; subject: string; status: TicketStatus; priority: TicketPriority; created_at: string
  store_name?: string; customer_name?: string
  messages: { content: string; sender_name: string }[]
}

function SupportTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: "", priority: "medium" as TicketPriority, store_name: "", customer_name: "" })
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!supabase) return; (async () => {
      let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (search) q = q.ilike("subject", `%${search}%`)
      const { data } = await q; setTickets((data as Ticket[]) ?? []); setLoading(false)
    })()
  }, [search, page, supabase])

  async function sendReply() {
    if (!supabase || !selected || !reply.trim()) return
    const msg = { content: reply, sender_name: "المشرف", created_at: new Date().toISOString() }
    const msgs = [...(selected.messages ?? []), msg]
    await supabase.from("support_tickets").update({ messages: msgs, status: "in_progress" }).eq("id", selected.id)
    setSelected({ ...selected, messages: msgs, status: "in_progress" }); setReply("")
  }

  async function createTicket() {
    if (!supabase || !newTicket.subject) return
    await supabase.from("support_tickets").insert({
      subject: newTicket.subject, priority: newTicket.priority,
      store_name: newTicket.store_name || null, customer_name: newTicket.customer_name || null,
      messages: [{ content: "تم فتح التذكرة بواسطة المشرف", sender_name: "نظام", created_at: new Date().toISOString() }],
    })
    setShowNew(false); setNewTicket({ subject: "", priority: "medium", store_name: "", customer_name: "" })
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-on-surface">الدعم الفني</h1><p className="text-sm text-on-surface-variant">إدارة تذاكر الدعم</p></div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" />تذكرة جديدة</button>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="بحث..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold text-on-surface">تذكرة جديدة</h3>
              <button onClick={() => setShowNew(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <input value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder="عنوان التذكرة"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <div className="grid grid-cols-2 gap-3">
                <input value={newTicket.store_name} onChange={(e) => setNewTicket({ ...newTicket, store_name: e.target.value })} placeholder="اسم المتجر"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <input value={newTicket.customer_name} onChange={(e) => setNewTicket({ ...newTicket, customer_name: e.target.value })} placeholder="اسم العميل"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option><option value="urgent">عاجلة</option>
              </select>
              <button onClick={createTicket} disabled={!newTicket.subject}
                className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white disabled:opacity-50">إنشاء التذكرة</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
            tickets.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا توجد تذاكر</p> :
            tickets.map((t) => (
              <div key={t.id} onClick={() => setSelected(t)}
                className={cn("cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:shadow-md",
                  selected?.id === t.id ? "border-primary" : "border-outline-variant/50")}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 ml-2">
                    <h3 className="text-sm font-medium text-on-surface truncate">{t.subject}</h3>
                    <p className="text-xs text-on-surface-variant">{t.store_name || ""}{t.store_name && t.customer_name ? " - " : ""}{t.customer_name || ""}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <span className={cn("rounded-lg px-2 py-0.5 text-xs", statusColors[t.status])}>{t.status}</span>
                    <span className={cn("rounded-lg px-2 py-0.5 text-xs", priorityColors[t.priority])}>{t.priority}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">{new Date(t.created_at).toLocaleDateString("ar-SA")}</p>
              </div>
            ))}
          <Pagination page={page} total={tickets.length} onChange={setPage} />
        </div>
        {selected && (
          <div className="rounded-2xl border border-outline-variant/50 bg-white flex flex-col">
            <div className="border-b border-outline-variant/50 p-4"><h3 className="font-bold text-on-surface">{selected.subject}</h3></div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-96">
              {(selected.messages ?? []).map((msg, i) => (
                <div key={i} className={cn("rounded-xl p-3 max-w-[80%]", msg.sender_name === "المشرف" ? "bg-primary/10 mr-auto" : "bg-surface-container")}>
                  <p className="text-xs font-medium text-on-surface-variant mb-1">{msg.sender_name}</p>
                  <p className="text-sm text-on-surface">{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant/50 p-4">
              <div className="flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="اكتب رداً..."
                  className="flex-1 rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && sendReply()} />
                <button onClick={sendReply} disabled={!reply.trim()}
                  className="flex items-center justify-center rounded-xl bg-primary px-4 text-white disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface AuditEntry {
  id: string; action: string; resource: string; resource_id: string; details: Record<string, unknown>; created_at: string
}

function AuditTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!supabase) return
    supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      .then(({ data, count }) => { setLogs((data as AuditEntry[]) ?? []); setLoading(false) })
  }, [page, supabase])

  const filtered = logs.filter((l) => !search || l.action.includes(search) || l.resource.includes(search))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-on-surface">سجل العمليات</h1><p className="text-sm text-on-surface-variant">جميع العمليات على المنصة</p></div>
        <button onClick={() => exportCSV(["الإجراء", "المورد", "المعرف", "التاريخ"],
          filtered.map((l) => [l.action, l.resource, l.resource_id || "", new Date(l.created_at).toLocaleString("ar-SA")]),
          "سجل_العمليات.csv")}
          className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"><Download className="h-4 w-4" />تصدير</button>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        filtered.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا توجد عمليات</p> :
        <div className="space-y-2">{filtered.map((log) => (
          <div key={log.id} className="rounded-xl border border-outline-variant/30 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{log.action}</span>
                <span className="text-sm text-on-surface-variant">{log.resource}</span>
                {log.resource_id && <span className="text-xs text-on-surface-variant/50" dir="ltr">#{log.resource_id.slice(0, 8)}</span>}
              </div>
              <span className="text-xs text-on-surface-variant">{new Date(log.created_at).toLocaleString("ar-SA")}</span>
            </div>
          </div>
        ))}</div>
      }
      <Pagination page={page} total={filtered.length} onChange={setPage} />
    </div>
  )
}

const settingsSubTabs = [
  { id: "general", label: "عام" }, { id: "plans", label: "الخطط والأسعار" },
  { id: "payment", label: "بوابات الدفع" }, { id: "email", label: "البريد الإلكتروني" }, { id: "maintenance", label: "الصيانة" },
]

function SettingsTab() {
  const [active, setActive] = useState("general")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({
    platform_name: "Emerald Commerce", platform_desc: "منصة التجارة المحادثتية", default_lang: "ar",
    plan_free: "free", plan_basic: "99", plan_pro: "199", plan_enterprise: "399",
    stripe_key: "sk_live_...", stripe_webhook: "whsec_...",
    smtp_host: "smtp.sendgrid.net", smtp_port: "587", smtp_user: "apikey", smtp_pass: "SG.xxxxx",
    maintenance_mode: "false", maintenance_msg: "المنصة تحت الصيانة حالياً. سنعود قريباً!",
  })

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((data) => {
      if (data && !data.error) setValues((prev) => ({ ...prev, ...data }))
    }).catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const payload: Record<string, string> = {}
      if (active === "general") { payload.platform_name = values.platform_name; payload.platform_desc = values.platform_desc; payload.default_lang = values.default_lang }
      else if (active === "plans") { payload.plan_free = values.plan_free; payload.plan_basic = values.plan_basic; payload.plan_pro = values.plan_pro; payload.plan_enterprise = values.plan_enterprise }
      else if (active === "payment") { payload.stripe_key = values.stripe_key; payload.stripe_webhook = values.stripe_webhook }
      else if (active === "email") { payload.smtp_host = values.smtp_host; payload.smtp_port = values.smtp_port; payload.smtp_user = values.smtp_user; payload.smtp_pass = values.smtp_pass }
      else if (active === "maintenance") { payload.maintenance_mode = values.maintenance_mode; payload.maintenance_msg = values.maintenance_msg }
      await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold text-on-surface">إعدادات المنصة</h1><p className="text-sm text-on-surface-variant">إعدادات وتحكمات المنصة</p></div>
      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {settingsSubTabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={cn("shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors",
              active === t.id ? "bg-primary text-white" : "bg-white text-on-surface-variant border border-outline-variant/50 hover:border-primary/30 hover:text-primary"
            )}>{t.label}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
        {active === "general" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">إعدادات عامة</h3>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">اسم المنصة</label>
              <input value={values.platform_name} onChange={(e) => setValues({ ...values, platform_name: e.target.value })}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">الوصف</label>
              <textarea value={values.platform_desc} onChange={(e) => setValues({ ...values, platform_desc: e.target.value })} rows={2}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">اللغة الافتراضية</label>
              <select value={values.default_lang} onChange={(e) => setValues({ ...values, default_lang: e.target.value })}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option value="ar">العربية</option><option value="en">English</option>
              </select></div>
          </div>
        )}
        {active === "plans" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">الخطط والأسعار</h3>
            {[{ key: "plan_free", name: "مجاني" }, { key: "plan_basic", name: "أساسي" }, { key: "plan_pro", name: "احترافي" }, { key: "plan_enterprise", name: "متقدم" }].map((p) => (
              <div key={p.key} className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4">
                <span className="text-sm font-medium text-on-surface">{p.name}</span>
                <input value={values[p.key]} onChange={(e) => setValues({ ...values, [p.key]: e.target.value })}
                  className="w-32 rounded-xl border border-outline-variant/50 px-3 py-1.5 text-sm outline-none focus:border-primary text-left" dir="ltr" placeholder="السعر" />
              </div>
            ))}
          </div>
        )}
        {active === "payment" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">بوابات الدفع</h3>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Stripe Secret Key</label>
              <input value={values.stripe_key} onChange={(e) => setValues({ ...values, stripe_key: e.target.value })} type="password"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Stripe Webhook Secret</label>
              <input value={values.stripe_webhook} onChange={(e) => setValues({ ...values, stripe_webhook: e.target.value })} type="password"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
          </div>
        )}
        {active === "email" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">إعدادات البريد</h3>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">SMTP Host</label>
              <input value={values.smtp_host} onChange={(e) => setValues({ ...values, smtp_host: e.target.value })}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Port</label>
                <input value={values.smtp_port} onChange={(e) => setValues({ ...values, smtp_port: e.target.value })}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Username</label>
                <input value={values.smtp_user} onChange={(e) => setValues({ ...values, smtp_user: e.target.value })}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
            </div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Password</label>
              <input value={values.smtp_pass} onChange={(e) => setValues({ ...values, smtp_pass: e.target.value })} type="password"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
          </div>
        )}
        {active === "maintenance" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">وضع الصيانة</h3>
            <label className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4 cursor-pointer">
              <div><p className="text-sm font-medium text-on-surface">تفعيل وضع الصيانة</p><p className="text-xs text-on-surface-variant mt-1">عند التفعيل، ستظهر رسالة الصيانة للزوار</p></div>
              <input type="checkbox" checked={values.maintenance_mode === "true"} onChange={(e) => setValues({ ...values, maintenance_mode: e.target.checked ? "true" : "false" })}
                className="h-5 w-5 rounded text-primary" />
            </label>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">رسالة الصيانة</label>
              <textarea value={values.maintenance_msg} onChange={(e) => setValues({ ...values, maintenance_msg: e.target.value })} rows={3}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3 border-t border-outline-variant/50 pt-6">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            حفظ الإعدادات
          </button>
          {saved && <span className="text-sm text-emerald-600">تم الحفظ</span>}
        </div>
      </div>
    </div>
  )
}
