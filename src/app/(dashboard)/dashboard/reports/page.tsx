"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

function exportCSV(data: MonthlyRevenue[]) {
  const headers = ["الشهر", "الطلبات", "الإيرادات"]
  const rows = data.map((d) => [d.month, String(d.orders), String(d.revenue)])
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const a = document.createElement("a")
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
  a.download = "تقرير_المبيعات.csv"
  a.click()
}

export default function ReportsPage() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<7 | 30 | 90>(30)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const since = new Date()
    since.setDate(since.getDate() - period)

    supabase
      .from("orders")
      .select("total, created_at")
      .gte("created_at", since.toISOString())
      .then(({ data: orders }) => {
        if (!orders) { setLoading(false); return }
        const total = orders.reduce((s, o) => s + Number(o.total), 0)
        setTotalRevenue(total)
        setTotalOrders(orders.length)

        const monthlyMap: Record<string, { revenue: number; orders: number }> = {}
        orders.forEach((o) => {
          const month = new Date(o.created_at).toLocaleDateString("ar-SA", { month: "long", year: "numeric" })
          if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, orders: 0 }
          monthlyMap[month].revenue += Number(o.total)
          monthlyMap[month].orders += 1
        })

        setData(Object.entries(monthlyMap).map(([month, stats]) => ({ month, ...stats })))
        setLoading(false)
      })
  }, [period])

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">التقارير والتحليلات</h1>
          <p className="mt-1 text-sm text-on-surface-variant">إحصائيات أداء متجرك</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn("rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                period === p
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant/50 text-on-surface-variant hover:border-primary/30 hover:text-primary"
              )}>
              {p === 7 ? "7 أيام" : p === 30 ? "30 يوم" : "90 يوم"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/50 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-on-surface">
                {totalRevenue.toLocaleString("ar-SA")} ريال
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-outline-variant/50 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-on-surface">
                {totalOrders.toLocaleString("ar-SA")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-on-surface">المبيعات الشهرية</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-sm text-on-surface-variant">لا توجد بيانات</div>
        ) : (
          <>
            <div className="space-y-4">
              {data.map((item) => (
                <div key={item.month}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">{item.month}</span>
                    <div className="flex gap-4">
                      <span className="text-on-surface-variant">{item.orders} طلب</span>
                      <span className="font-medium text-on-surface">{item.revenue.toLocaleString("ar-SA")} ريال</span>
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-primary to-primary/60 transition-all duration-500"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => exportCSV(data)}
                className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-5 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
