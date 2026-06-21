"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Store, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Merchant {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  store: { name: string; is_active: boolean } | null
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const supabase = createClient()

  async function fetchMerchants() {
    if (!supabase) return
    let query = supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, store:stores(name, is_active)")
      .eq("role", "merchant")
      .order("created_at", { ascending: false })

    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await query
    setMerchants((data as unknown as Merchant[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchMerchants() }, [search])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">التجار</h1>
          <p className="mt-1 text-sm text-on-surface-variant">إدارة جميع التجار المسجلين</p>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم التاجر أو البريد..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus:border-primary" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : merchants.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/50 bg-white py-20 text-center">
          <Store className="mx-auto h-12 w-12 text-on-surface-variant/50" />
          <p className="mt-4 text-on-surface-variant">لا يوجد تجار</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التاجر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المتجر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container/30">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{m.full_name || "---"}</p>
                      <p className="text-xs text-on-surface-variant" dir="ltr">{m.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{m.store?.name ?? "---"}</td>
                  <td className="px-6 py-4">
                    <span className={cn("flex items-center gap-1.5 text-sm",
                      m.store?.is_active ? "text-emerald-600" : "text-red-500")}>
                      {m.store?.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {m.store?.is_active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(m.created_at).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
