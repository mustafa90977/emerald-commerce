"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Users, Loader2, Plus, X } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function fetchCustomers() {
    if (!supabase) return
    let query = supabase.from("customers").select("*").order("created_at", { ascending: false })
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    const { data } = await query
    setCustomers((data as Customer[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCustomers() }, [search])

  async function handleAdd() {
    if (!supabase || !form.name) return
    setSaving(true)
    await supabase.from("customers").insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: "", email: "", phone: "" })
    fetchCustomers()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">العملاء</h1>
          <p className="mt-1 text-sm text-on-surface-variant">إدارة قاعدة عملاء متجرك</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          إضافة عميل
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم، بريد، أو هاتف..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus:border-primary" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">إضافة عميل</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">الاسم *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">البريد</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">الهاتف</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <button onClick={handleAdd} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                إضافة العميل
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/50 bg-white py-20 text-center">
          <Users className="mx-auto h-12 w-12 text-on-surface-variant/50" />
          <p className="mt-4 text-on-surface-variant">لا يوجد عملاء</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-outline-variant/50 bg-white md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container/50">
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">البريد</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الهاتف</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الطلبات</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">إجمالي الإنفاق</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container/30">
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant" dir="ltr">{c.email || "---"}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant" dir="ltr">{c.phone || "---"}</td>
                    <td className="px-6 py-4 text-sm text-on-surface">{c.total_orders}</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      {c.total_spent.toLocaleString("ar-SA")} ريال
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {customers.map((c) => (
              <div key={c.id} className="rounded-2xl border border-outline-variant/50 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{c.name}</p>
                    <p className="text-xs text-on-surface-variant" dir="ltr">{c.email || "---"}</p>
                  </div>
                  <span className="text-sm font-semibold text-on-surface">
                    {c.total_spent.toLocaleString("ar-SA")} ريال
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-on-surface-variant">
                  <span dir="ltr">{c.phone || "---"}</span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-on-surface">{c.total_orders}</span>
                    طلب
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
