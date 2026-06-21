"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { TicketStatus, TicketPriority } from "@/lib/types"
import {
  LayoutDashboard, Store, HeadphonesIcon, History, Settings,
  Search, Loader2, ToggleRight, ToggleLeft, ChevronDown, Send, ShoppingCart, DollarSign, Users as UsersIcon,
} from "lucide-react"

const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "merchants", label: "التجار", icon: Store },
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

interface Merchant {
  id: string; full_name: string; email: string; role: string; created_at: string
  store: { name: string; is_active: boolean } | null
}

function MerchantsTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!supabase) return; (async () => {
      let q = supabase.from("profiles")
        .select("id, full_name, email, role, created_at, store:stores(name, is_active)")
        .eq("role", "merchant").order("created_at", { ascending: false })
      if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      const { data } = await q
      setMerchants((data as unknown as Merchant[]) ?? []); setLoading(false)
    })()
  }, [search, supabase])

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-on-surface">التجار</h1>
        <p className="text-sm text-on-surface-variant">إدارة جميع التجار المسجلين</p>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم التاجر أو البريد..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
        merchants.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا يوجد تجار</p> :
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white">
          <table className="w-full">
            <thead><tr className="border-b border-outline-variant/50 bg-surface-container/50">
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التاجر</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المتجر</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الحالة</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">تاريخ التسجيل</th>
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
              </tr>
            ))}</tbody>
          </table>
        </div>
      }
    </div>
  )
}

interface Ticket {
  id: string; subject: string; status: TicketStatus; priority: TicketPriority; created_at: string
  messages: { content: string; sender_name: string }[]
}

function SupportTab({ supabase }: { supabase: ReturnType<typeof createClient> | null }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState("")

  useEffect(() => {
    if (!supabase) return; (async () => {
      let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false })
      if (search) q = q.ilike("subject", `%${search}%`)
      const { data } = await q; setTickets((data as Ticket[]) ?? []); setLoading(false)
    })()
  }, [search, supabase])

  async function sendReply() {
    if (!supabase || !selected || !reply.trim()) return
    const msg = { content: reply, sender_name: "المشرف", created_at: new Date().toISOString() }
    const msgs = [...(selected.messages ?? []), msg]
    await supabase.from("support_tickets").update({ messages: msgs, status: "in_progress" }).eq("id", selected.id)
    setSelected({ ...selected, messages: msgs, status: "in_progress" }); setReply("")
  }

  return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold text-on-surface">الدعم الفني</h1><p className="text-sm text-on-surface-variant">إدارة تذاكر الدعم</p></div>
      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-primary" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> :
            tickets.length === 0 ? <p className="py-20 text-center text-on-surface-variant">لا توجد تذاكر</p> :
            tickets.map((t) => (
              <div key={t.id} onClick={() => setSelected(t)}
                className={cn("cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:shadow-md",
                  selected?.id === t.id ? "border-primary" : "border-outline-variant/50")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-on-surface">{t.subject}</h3>
                  <div className="flex gap-2">
                    <span className={cn("rounded-lg px-2 py-0.5 text-xs", statusColors[t.status])}>{t.status}</span>
                    <span className={cn("rounded-lg px-2 py-0.5 text-xs", priorityColors[t.priority])}>{t.priority}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">{new Date(t.created_at).toLocaleDateString("ar-SA")}</p>
              </div>
            ))}
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

  useEffect(() => {
    if (!supabase) return
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { setLogs((data as AuditEntry[]) ?? []); setLoading(false) })
  }, [supabase])

  const filtered = logs.filter((l) => !search || l.action.includes(search) || l.resource.includes(search))

  return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold text-on-surface">سجل العمليات</h1><p className="text-sm text-on-surface-variant">جميع العمليات على المنصة</p></div>
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
  const save = async () => { await new Promise((r) => setTimeout(r, 500)); setSaved(true); setTimeout(() => setSaved(false), 2000) }

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
              <input defaultValue="Emerald Commerce" className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">الوصف</label>
              <textarea defaultValue="منصة التجارة المحادثتية" rows={2} className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">اللغة الافتراضية</label>
              <select className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option>العربية</option><option>English</option>
              </select></div>
          </div>
        )}
        {active === "plans" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">الخطط والأسعار</h3>
            {[{ name: "مجاني", price: "٠ ريال" }, { name: "أساسي", price: "٩٩ ريال/شهر" }, { name: "احترافي", price: "١٩٩ ريال/شهر" }, { name: "متقدم", price: "٣٩٩ ريال/شهر" }].map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4">
                <span className="text-sm font-medium text-on-surface">{p.name}</span>
                <span className="text-sm text-on-surface-variant">{p.price}</span>
              </div>
            ))}
          </div>
        )}
        {active === "payment" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">بوابات الدفع</h3>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Stripe Secret Key</label>
              <input type="password" defaultValue="sk_live_..." className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Stripe Webhook Secret</label>
              <input type="password" defaultValue="whsec_..." className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
          </div>
        )}
        {active === "email" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">إعدادات البريد</h3>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">SMTP Host</label>
              <input defaultValue="smtp.sendgrid.net" className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Port</label><input defaultValue="587" className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Username</label><input defaultValue="apikey" className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
            </div>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">Password</label>
              <input type="password" defaultValue="SG.xxxxx" className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" /></div>
          </div>
        )}
        {active === "maintenance" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">وضع الصيانة</h3>
            <label className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4 cursor-pointer">
              <div><p className="text-sm font-medium text-on-surface">تفعيل وضع الصيانة</p><p className="text-xs text-on-surface-variant mt-1">عند التفعيل، ستظهر رسالة الصيانة للزوار</p></div>
              <input type="checkbox" className="h-5 w-5 rounded text-primary" />
            </label>
            <div><label className="mb-1.5 block text-sm font-medium text-on-surface">رسالة الصيانة</label>
              <textarea defaultValue="المنصة تحت الصيانة حالياً. سنعود قريباً!" rows={3} className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3 border-t border-outline-variant/50 pt-6">
          <button onClick={save} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">حفظ الإعدادات</button>
          {saved && <span className="text-sm text-emerald-600">تم الحفظ</span>}
        </div>
      </div>
    </div>
  )
}
