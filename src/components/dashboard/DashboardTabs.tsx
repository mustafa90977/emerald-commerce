"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { OrderStatus, Order, Product, Customer } from "@/lib/types"
import {
  LayoutDashboard, Receipt, Package, Users, BarChart3, Settings, CreditCard,
  Search, Filter, ChevronDown, Eye, Loader2, Plus, Edit3, Trash2, X,
  DollarSign, ShoppingCart, TrendingUp, Download, Store, MessageCircle,
  Truck, Save, Check, ToggleRight, ToggleLeft, HeadphonesIcon, Send, History, Paintbrush,
} from "lucide-react"
import { TemplateSelector } from "./TemplateSelector"

// ─── Tabs ──────────────────────────────────────────────
const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "orders", label: "الطلبات", icon: Receipt },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "customers", label: "العملاء", icon: Users },
  { id: "reports", label: "التقارير", icon: BarChart3 },
  { id: "settings", label: "الإعدادات", icon: Settings },
  { id: "subscription", label: "الاشتراك", icon: CreditCard },
  { id: "appearance", label: "شكل المتجر", icon: Paintbrush },
]

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التوصيل", cancelled: "ملغي",
}
const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

// ─── Export helper ─────────────────────────────────────
function exportCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const a = document.createElement("a")
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
  a.download = filename
  a.click()
}

// ─── Component ─────────────────────────────────────────
export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Tab bar */}
      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-on-surface-variant border border-outline-variant/50 hover:border-primary/30 hover:text-primary"
              )}>
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "overview" && <OverviewTab supabase={supabase} />}
      {activeTab === "orders" && <OrdersTab supabase={supabase} />}
      {activeTab === "products" && <ProductsTab supabase={supabase} />}
      {activeTab === "customers" && <CustomersTab supabase={supabase} />}
      {activeTab === "reports" && <ReportsTab supabase={supabase} />}
      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "subscription" && <SubscriptionTab supabase={supabase} />}
      {activeTab === "appearance" && <TemplateSelector />}
    </div>
  )
}

// ─── Overview Tab ──────────────────────────────────────
function OverviewTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [stats, setStats] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    if (!supabase) return; (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from("profiles").select("store_id").eq("id", user.id).single()
      if (!profile?.store_id) return
      const sid = profile.store_id
      const [{ count: o }, { data: rev }, { count: c }, { count: p }] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", sid),
        supabase.from("orders").select("total").eq("store_id", sid).eq("payment_status", "paid"),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("store_id", sid),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", sid).eq("is_active", true),
      ])
      setStats({
        orders: o ?? 0, revenue: rev?.reduce((s, r) => s + Number(r.total), 0) ?? 0,
        customers: c ?? 0, products: p ?? 0,
      })
    })()
  }, [supabase])

  const cards = [
    { label: "إجمالي المبيعات", value: stats ? `${stats.revenue.toLocaleString("ar-SA")} ريال` : "---", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "إجمالي الطلبات", value: stats?.orders.toLocaleString("ar-SA") ?? "---", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "العملاء", value: stats?.customers.toLocaleString("ar-SA") ?? "---", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "المنتجات", value: stats?.products.toLocaleString("ar-SA") ?? "---", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  ]
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-on-surface">نظرة عامة</h1>
      <p className="mb-6 text-sm text-on-surface-variant">مرحباً بك في لوحة التحكم</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-2xl border border-outline-variant/50 bg-surface p-5 transition-all hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
                <Icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <p className="mt-4 text-2xl font-bold text-on-surface">{c.value}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{c.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Orders Tab ────────────────────────────────────────
function OrdersTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")

  const fetch = useCallback(async () => {
    if (!supabase) return
    let q = supabase.from("orders").select("*, customer:customers(name, phone)").order("created_at", { ascending: false })
    if (filter !== "all") q = q.eq("status", filter)
    if (search) q = q.or(`order_number.ilike.%${search}%,customer.name.ilike.%${search}%`)
    const { data } = await q; setOrders((data as unknown as Order[]) ?? []); setLoading(false)
  }, [search, filter, supabase])
  useEffect(() => { fetch() }, [fetch])

  async function updateStatus(id: string, status: string) {
    if (!supabase) return; await supabase.from("orders").update({ status }).eq("id", id); fetch()
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-xl font-bold text-on-surface">الطلبات</h1><p className="text-sm text-on-surface-variant">إدارة وتتبع جميع الطلبات</p></div>
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم الطلب أو اسم العميل..."
            className="w-full rounded-xl border border-outline-variant/50 bg-surface py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-outline-variant/50 bg-surface py-3 px-4 text-sm outline-none focus:border-primary">
          <option value="all">جميع الحالات</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        orders.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا توجد طلبات</p> :
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface md:block">
            <table className="w-full">
              <thead><tr className="border-b border-outline-variant/50 bg-surface-container/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">رقم الطلب</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المجموع</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التاريخ</th>
              </tr></thead>
              <tbody>{orders.map((o) => {
                const cust = (o as unknown as Record<string, { name: string }>).customer
                return <tr key={o.id} className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container/30">
                  <td className="px-6 py-4 text-sm font-medium text-on-surface" dir="ltr">{o.order_number}</td>
                  <td className="px-6 py-4 text-sm text-on-surface">{cust?.name ?? "---"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{o.total.toLocaleString("ar-SA")} ريال</td>
                  <td className="px-6 py-4">
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={cn("appearance-none rounded-lg border px-3 py-1 text-xs font-medium outline-none", statusColors[o.status])}>
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(o.created_at).toLocaleDateString("ar-SA")}</td>
                </tr>
              })}</tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">{orders.map((o) => {
            const cust = (o as unknown as Record<string, { name: string }>).customer
            return <div key={o.id} className="rounded-2xl border border-outline-variant/50 bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface" dir="ltr">{o.order_number}</span>
                <span className={cn("rounded-lg border px-2.5 py-0.5 text-xs font-medium", statusColors[o.status])}>{statusLabels[o.status]}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-on-surface">{cust?.name ?? "---"}</p>
                <p className="text-sm font-semibold text-on-surface">{o.total.toLocaleString("ar-SA")} ريال</p>
              </div>
            </div>
          })}</div>
        </>
      }
    </div>
  )
}

// ─── Products Tab ──────────────────────────────────────
function ProductsTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editP, setEditP] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: "", price: "", stock: "0", category: "" })

  async function fetchP() {
    if (!supabase) return
    let q = supabase.from("products").select("*").order("created_at", { ascending: false })
    if (search) q = q.ilike("name", `%${search}%`)
    const { data } = await q; setProducts((data as Product[]) ?? []); setLoading(false)
  }
  useEffect(() => { fetchP() }, [search])

  async function saveP() {
    if (!supabase || !form.name || !form.price) return
    const p = { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, category: form.category }
    if (editP) await supabase.from("products").update(p).eq("id", editP.id)
    else await supabase.from("products").insert(p)
    setShowForm(false); setEditP(null); setForm({ name: "", price: "", stock: "0", category: "" }); fetchP()
  }
  async function delP(id: string) { if (!supabase || !confirm("حذف المنتج؟")) return; await supabase.from("products").delete().eq("id", id); fetchP() }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-on-surface">المنتجات</h1><p className="text-sm text-on-surface-variant">إدارة منتجات متجرك</p></div>
        <button onClick={() => { setEditP(null); setForm({ name: "", price: "", stock: "0", category: "" }); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />إضافة منتج</button>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث عن منتج..."
          className="w-full rounded-xl border border-outline-variant/50 bg-surface py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl border border-outline-variant/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editP ? "تعديل منتج" : "إضافة منتج"}</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المنتج"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="السعر"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="المخزون"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="التصنيف"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <button onClick={saveP} className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white">{editP ? "حفظ" : "إضافة"}</button>
            </div>
          </div>
        </div>
      )}
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        products.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا توجد منتجات</p> :
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface">
          <table className="w-full">
            <thead><tr className="border-b border-outline-variant/50 bg-surface-container/50">
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المنتج</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">السعر</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المخزون</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-on-surface-variant">إجراءات</th>
            </tr></thead>
            <tbody>{products.map((p) => (
              <tr key={p.id} className="border-b border-outline-variant/30">
                <td className="px-6 py-4 text-sm font-medium text-on-surface">{p.name}</td>
                <td className="px-6 py-4 text-sm text-on-surface">{p.price.toLocaleString("ar-SA")} ريال</td>
                <td className="px-6 py-4 text-sm">{p.stock > 0 ? <span className="text-on-surface">{p.stock}</span> : <span className="text-red-500">{p.stock}</span>}</td>
                <td className="px-6 py-4"><div className="flex items-center justify-center gap-2">
                  <button onClick={() => { setEditP(p); setForm({ name: p.name, price: String(p.price), stock: String(p.stock), category: p.category ?? "" }); setShowForm(true) }}
                    className="rounded-lg p-2 text-on-surface-variant hover:text-primary"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => delP(p.id)} className="rounded-lg p-2 text-on-surface-variant hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      }
    </div>
  )
}

// ─── Customers Tab ─────────────────────────────────────
function CustomersTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [customers, setC] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!supabase) return; (async () => {
      let q = supabase.from("customers").select("*").order("created_at", { ascending: false })
      if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      const { data } = await q; setC((data as Customer[]) ?? []); setLoading(false)
    })()
  }, [search, supabase])

  return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold text-on-surface">العملاء</h1><p className="text-sm text-on-surface-variant">قاعدة عملاء متجرك</p></div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم، بريد، أو هاتف..."
          className="w-full rounded-xl border border-outline-variant/50 bg-surface py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        customers.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا يوجد عملاء</p> :
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface">
          <table className="w-full">
            <thead><tr className="border-b border-outline-variant/50 bg-surface-container/50">
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الاسم</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الهاتف</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الطلبات</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الإنفاق</th>
            </tr></thead>
            <tbody>{customers.map((c) => (
              <tr key={c.id} className="border-b border-outline-variant/30">
                <td className="px-6 py-4 text-sm font-medium text-on-surface">{c.name}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant" dir="ltr">{c.phone || "---"}</td>
                <td className="px-6 py-4 text-sm text-on-surface">{c.total_orders}</td>
                <td className="px-6 py-4 text-sm font-medium text-on-surface">{c.total_spent.toLocaleString("ar-SA")} ريال</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      }
    </div>
  )
}

// ─── Reports Tab ───────────────────────────────────────
function ReportsTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [data, setData] = useState<{ month: string; revenue: number; orders: number }[]>([])
  const [totalRev, setTotalRev] = useState(0)
  const [totalOrd, setTotalOrd] = useState(0)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<number>(30)

  useEffect(() => {
    if (!supabase) return; (async () => {
      const since = new Date(); since.setDate(since.getDate() - period)
      const { data: orders } = await supabase.from("orders").select("total, created_at").gte("created_at", since.toISOString())
      if (!orders) { setLoading(false); return }
      const rev = orders.reduce((s, o) => s + Number(o.total), 0)
      setTotalRev(rev); setTotalOrd(orders.length)
      const map: Record<string, { revenue: number; orders: number }> = {}
      orders.forEach((o) => {
        const m = new Date(o.created_at).toLocaleDateString("ar-SA", { month: "long", year: "numeric" })
        if (!map[m]) map[m] = { revenue: 0, orders: 0 }
        map[m].revenue += Number(o.total); map[m].orders += 1
      })
      setData(Object.entries(map).map(([month, s]) => ({ month, ...s })))
      setLoading(false)
    })()
  }, [period, supabase])
  const maxRev = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-on-surface">التقارير</h1><p className="text-sm text-on-surface-variant">إحصائيات أداء متجرك</p></div>
        <div className="flex gap-2">{[7, 30, 90].map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={cn("rounded-lg border px-4 py-2 text-xs font-medium", period === p ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/50 text-on-surface-variant")}>{p} يوم</button>
        ))}</div>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/50 bg-surface p-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50"><DollarSign className="h-6 w-6 text-emerald-600" /></div>
          <div><p className="text-sm text-on-surface-variant">إجمالي المبيعات</p><p className="text-2xl font-bold text-on-surface">{totalRev.toLocaleString("ar-SA")} ريال</p></div>
        </div>
        <div className="rounded-2xl border border-outline-variant/50 bg-surface p-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50"><ShoppingCart className="h-6 w-6 text-blue-600" /></div>
          <div><p className="text-sm text-on-surface-variant">إجمالي الطلبات</p><p className="text-2xl font-bold text-on-surface">{totalOrd.toLocaleString("ar-SA")}</p></div>
        </div>
      </div>
      <div className="rounded-2xl border border-outline-variant/50 bg-surface p-6">
        <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-primary" /><h3 className="text-sm font-semibold">المبيعات</h3></div>
        {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
          data.length === 0 ? <p className="py-10 text-center text-sm text-on-surface-variant">لا توجد بيانات</p> :
          <div className="space-y-4">{data.map((d) => (
            <div key={d.month}>
              <div className="mb-1 flex justify-between text-sm"><span className="text-on-surface-variant">{d.month}</span><span className="font-medium">{d.revenue.toLocaleString("ar-SA")} ريال</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-gradient-to-l from-primary to-primary/60 transition-all" style={{ width: `${(d.revenue / maxRev) * 100}%` }} /></div>
            </div>
          ))}</div>
        }
        <div className="mt-4 flex justify-end">
          <button onClick={() => exportCSV(["الشهر", "الطلبات", "الإيرادات"], data.map((d) => [d.month, String(d.orders), String(d.revenue)]), "تقرير_المبيعات.csv")}
            className="flex items-center gap-2 rounded-xl border bg-surface px-5 py-2.5 text-sm font-medium"><Download className="h-4 w-4" />تصدير</button>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ──────────────────────────────────────
const settingsTabs = [
  { id: "general", label: "معلومات المتجر", icon: Store },
  { id: "whatsapp", label: "واتساب", icon: MessageCircle },
  { id: "payment", label: "الدفع", icon: CreditCard },
  { id: "shipping", label: "الشحن", icon: Truck },
]
function SettingsTab() {
  const [active, setActive] = useState("general")
  const [saved, setSaved] = useState(false)
  const save = async () => { await new Promise((r) => setTimeout(r, 500)); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold text-on-surface">الإعدادات</h1><p className="text-sm text-on-surface-variant">إعدادات متجرك</p></div>
      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {settingsTabs.map((t) => {
          const Icon = t.icon
          return <button key={t.id} onClick={() => setActive(t.id)}
            className={cn("flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              active === t.id ? "bg-primary text-white" : "bg-surface border border-outline-variant/50 text-on-surface-variant")}>
            <Icon className="h-4 w-4" />{t.label}
          </button>
        })}
      </div>
      <div className="rounded-2xl border border-outline-variant/50 bg-surface p-6">
        {active === "general" && <div className="space-y-4">
          <h3 className="font-bold">معلومات المتجر</h3>
          <div><label className="block text-sm font-medium mb-1">اسم المتجر</label><input defaultValue="متجري" className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">الوصف</label><textarea defaultValue="متجر إلكتروني" rows={3} className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
        </div>}
        {active === "whatsapp" && <WhatsAppTab />}
        {active === "payment" && <div className="space-y-4">
          <h3 className="font-bold">بوابات الدفع</h3>
          {["مدى", "فيزا/ماستركارد", "آبل باي", "Stripe"].map((m) => (
            <label key={m} className="flex items-center justify-between rounded-xl border p-4 cursor-pointer">
              <span className="text-sm">{m}</span>
              <input type="checkbox" defaultChecked={m !== "Stripe"} className="h-5 w-5 rounded text-primary" />
            </label>
          ))}
        </div>}
        {active === "shipping" && <div className="space-y-4">
          <h3 className="font-bold">الشحن</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">قيمة الشحن</label><input type="number" defaultValue="25" className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">مجاني عند</label><input type="number" defaultValue="200" className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none" /></div>
          </div>
        </div>}
        <div className="mt-6 flex items-center gap-3 border-t pt-6">
          <button onClick={save} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white"><Save className="inline h-4 w-4 ml-1" />حفظ</button>
          {saved && <span className="text-sm text-emerald-600">تم الحفظ</span>}
        </div>
      </div>
    </div>
  )
}

// ─── WhatsApp Tab ──────────────────────────────────
function WhatsAppTab() {
  const supabase = createClient()
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [welcomeMessage, setWelcomeMessage] = useState("السلام عليكم! كيف يمكننا مساعدتك؟")
  const [connected, setConnected] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [resultMsg, setResultMsg] = useState("")

  useEffect(() => {
    if (!supabase) return
    supabase.from("whatsapp_settings").select("*").single().then(({ data }) => {
      if (data) {
        setPhoneNumberId(data.phone_number_id || "")
        setAccessToken(data.access_token || "")
        setPhoneNumber(data.phone_number || "")
        setWelcomeMessage(data.welcome_message || welcomeMessage)
        setConnected(data.is_connected || false)
      }
    })
  }, [supabase])

  async function testConnection() {
    if (!phoneNumberId || !accessToken) return
    setTesting(true); setResult(null)
    try {
      const res = await fetch("/api/whatsapp/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number_id: phoneNumberId, access_token: accessToken }),
      })
      const d = await res.json()
      setResult(d.valid ? "success" : "error")
      setResultMsg(d.message || "")
    } catch { setResult("error"); setResultMsg("فشل الاتصال") }
    finally { setTesting(false) }
  }

  async function handleConnect() {
    if (!phoneNumberId || !accessToken || !phoneNumber) return
    setConnecting(true); setResult(null)
    try {
      const res = await fetch("/api/whatsapp/register-webhook", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number_id: phoneNumberId, access_token: accessToken, phone_number: phoneNumber }),
      })
      const d = await res.json()
      if (d.success) { setConnected(true); setResult("success"); setResultMsg(d.message) }
      else { setResult("error"); setResultMsg(d.error || "فشل") }
    } catch { setResult("error"); setResultMsg("فشل الاتصال") }
    finally { setConnecting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">واتساب</h3>
        {connected
          ? <span className="flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" />متصل</span>
          : <span className="flex items-center gap-1 text-sm text-red-500"><X className="h-4 w-4" />غير متصل</span>}
      </div>
      <p className="text-xs text-on-surface-variant">اربط رقم واتساب الخاص بك لإرسال الإشعارات للعملاء عبر رقمك.</p>
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container/20 p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number ID</label>
          <input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} dir="ltr" placeholder="123456789012345" className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:border-primary font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Access Token</label>
          <input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} dir="ltr" type="password" placeholder="EAAx..." className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:border-primary font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">رقم واتساب</label>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} dir="ltr" placeholder="+966500000000" className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={testConnection} disabled={testing || !phoneNumberId || !accessToken}
            className="flex items-center gap-1.5 rounded-xl border border-outline-variant/50 px-4 py-2 text-xs font-medium hover:bg-surface-container disabled:opacity-50">
            {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Settings className="h-3 w-3" />}اختبار
          </button>
          <button onClick={handleConnect} disabled={connecting || !phoneNumberId || !accessToken || !phoneNumber}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
            {connecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}{connecting ? "جاري..." : "ربط"}
          </button>
        </div>
        {result && (
          <div className={cn("rounded-lg p-2.5 text-xs", result === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
            {resultMsg}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">رسالة الترحيب</label>
        <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={2} className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:border-primary" />
      </div>
    </div>
  )
}

// ─── Subscription Tab ──────────────────────────────────
function SubscriptionTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const plans = [
    { key: "free", name: "مجاني", price: 0, features: ["منتجين", "١٠ طلبات"] },
    { key: "basic", name: "أساسي", price: 99, features: ["٢٠ منتج", "١٠٠ طلب", "دعم"] },
    { key: "pro", name: "احترافي", price: 199, features: ["غير محدود", "تقارير", "دعم 24/7"] },
    { key: "enterprise", name: "متقدم", price: 399, features: ["كل المميزات", "حسابات متعددة", "مدير حساب"] },
  ]
  useEffect(() => {
    if (!supabase) return; supabase.from("subscriptions").select("plan").single().then(({ data }) => { if (data) setPlan((data as { plan: string }).plan); setLoading(false) })
  }, [supabase])

  return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold text-on-surface">الاشتراك</h1><p className="text-sm text-on-surface-variant">إدارة باقتك</p></div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const isCurrent = p.key === plan
            return <div key={p.key} className={cn("flex flex-col rounded-2xl border bg-surface p-5", isCurrent ? "border-primary" : "border-outline-variant/50")}>
              <h4 className="text-lg font-bold">{p.name}</h4>
              <p className="mt-2">{p.price === 0 ? <span className="text-3xl font-bold">مجاني</span> : <><span className="text-3xl font-bold">{p.price}</span><span className="mr-1 text-sm text-on-surface-variant">ريال/شهر</span></>}</p>
              <ul className="mt-4 flex-1 space-y-2">{p.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{f}</li>)}</ul>
              <button disabled={isCurrent} className={cn("mt-5 rounded-xl py-2.5 text-center text-sm font-medium", isCurrent ? "bg-surface-container/50 text-on-surface-variant" : "bg-primary text-white")}>
                {isCurrent ? "باقتك الحالية" : "الترقية"}
              </button>
            </div>
          })}
        </div>
      )}
    </div>
  )
}
