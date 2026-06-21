"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Search, Filter, ChevronDown, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/types"

const statusLabels: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    let query = supabase
      .from("orders")
      .select("*, customer:customers(name, phone)")
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer.name.ilike.%${search}%`)
    }

    const { data } = await query
    setOrders((data as unknown as Order[]) ?? [])
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    const supabase = createClient()
    if (!supabase) return

    setUpdatingId(orderId)
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    setUpdatingId(null)
    fetchOrders()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">الطلبات</h1>
          <p className="mt-1 text-sm text-on-surface-variant">إدارة وتتبع جميع طلبات متجرك</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب أو اسم العميل..."
            className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus:border-primary"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="appearance-none rounded-xl border border-outline-variant/50 bg-white py-3 pr-4 pl-10 text-sm text-on-surface outline-none transition-colors focus:border-primary"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/50 bg-white py-20 text-center">
          <p className="text-on-surface-variant">لا توجد طلبات</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-outline-variant/50 bg-white md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container/50">
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">رقم الطلب</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الهاتف</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المجموع</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التاريخ</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-on-surface-variant">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container/30 cursor-pointer"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-on-surface" dir="ltr">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      {(order as unknown as Record<string, unknown>).customer
                        ? ((order as unknown as Record<string, { name: string }>).customer as { name: string }).name
                        : "---"}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant" dir="ltr">
                      {(order as unknown as Record<string, unknown>).customer
                        ? ((order as unknown as Record<string, { phone: string }>).customer as { phone: string }).phone
                        : "---"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      {order.total.toLocaleString("ar-SA")} ريال
                    </td>
                    <td className="px-6 py-4">
                      <span className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateStatus(order.id, e.target.value as OrderStatus)
                          }}
                          className={cn(
                            "appearance-none rounded-lg border px-3 py-1 text-xs font-medium outline-none",
                            statusColors[order.status]
                          )}
                          disabled={updatingId === order.id}
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2" />
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/orders/${order.id}`)
                        }}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                className="rounded-2xl border border-outline-variant/50 bg-white p-4 transition-colors hover:bg-surface-container/30 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface" dir="ltr">
                    {order.order_number}
                  </span>
                  <span
                    className={cn(
                      "rounded-lg border px-2.5 py-0.5 text-xs font-medium",
                      statusColors[order.status]
                    )}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-on-surface">
                      {(order as unknown as Record<string, unknown>).customer
                        ? ((order as unknown as Record<string, { name: string }>).customer as { name: string }).name
                        : "---"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-on-surface">
                    {order.total.toLocaleString("ar-SA")} ريال
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
