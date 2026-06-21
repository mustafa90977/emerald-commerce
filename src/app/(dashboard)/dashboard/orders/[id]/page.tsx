"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, Package, Truck, CheckCircle, XCircle, Clock, Loader2, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/types"

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
  processing: { label: "قيد التجهيز", icon: Package, color: "text-purple-600 bg-purple-50" },
  shipped: { label: "تم الشحن", icon: Truck, color: "text-indigo-600 bg-indigo-50" },
  delivered: { label: "تم التوصيل", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-red-600 bg-red-50" },
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setOrder(data as unknown as Order)
        setLoading(false)
      })
  }, [id])

  async function updateStatus(newStatus: OrderStatus) {
    const supabase = createClient()
    if (!supabase || !order) return

    setUpdating(true)
    await supabase.from("orders").update({ status: newStatus }).eq("id", id)
    setOrder({ ...order, status: newStatus })
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-outline-variant/50 bg-white py-20 text-center">
          <p className="text-on-surface-variant">الطلب غير موجود</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-primary hover:underline">
            العودة للطلبات
          </button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[order.status].icon
  const customer = (order as unknown as Record<string, unknown>).customer as Record<string, string> | undefined
  const items = (order.items ?? []) as Array<{ name: string; quantity: number; price: number; image?: string }>

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للطلبات
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-on-surface" dir="ltr">{order.order_number}</h1>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {new Date(order.created_at).toLocaleDateString("ar-SA", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div className={cn("flex items-center gap-2 rounded-xl px-4 py-2", statusConfig[order.status].color)}>
                <StatusIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{statusConfig[order.status].label}</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-on-surface mb-4">تحديث الحالة</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(statusConfig) as [OrderStatus, typeof statusConfig[OrderStatus]][]).map(
                  ([key, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={key}
                        onClick={() => updateStatus(key)}
                        disabled={updating || order.status === key}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                          order.status === key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-outline-variant/50 text-on-surface-variant hover:border-primary/30 hover:text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-on-surface mb-4">منتجات الطلب</h3>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-surface-container/30 p-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container">
                      <Package className="h-6 w-6 text-on-surface-variant" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">{item.name}</p>
                      <p className="text-xs text-on-surface-variant">الكمية: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">
                      {(item.price * item.quantity).toLocaleString("ar-SA")} ريال
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
            <h3 className="text-sm font-semibold text-on-surface mb-4">معلومات العميل</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-on-surface-variant">الاسم</p>
                <p className="text-sm font-medium text-on-surface">{customer?.name ?? "---"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">البريد</p>
                <p className="text-sm font-medium text-on-surface" dir="ltr">{customer?.email ?? "---"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">الهاتف</p>
                <p className="text-sm font-medium text-on-surface" dir="ltr">{customer?.phone ?? "---"}</p>
              </div>
              {customer?.phone && (
                <a
                  href={`https://wa.me/${customer.phone.replace(/^0+/, "966")}?text=${encodeURIComponent(`السلام عليكم، بخصوص طلبك ${order.order_number}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#128C7E]"
                >
                  <MessageCircle className="h-4 w-4" />
                  تواصل عبر واتساب
                </a>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
            <h3 className="text-sm font-semibold text-on-surface mb-4">ملخص الدفع</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">المجموع الفرعي</span>
                <span className="text-on-surface">{order.subtotal.toLocaleString("ar-SA")} ريال</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">الشحن</span>
                <span className="text-on-surface">{order.shipping.toLocaleString("ar-SA")} ريال</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">الضريبة</span>
                <span className="text-on-surface">{order.tax.toLocaleString("ar-SA")} ريال</span>
              </div>
              <div className="border-t border-outline-variant/50 pt-3 flex justify-between text-sm font-bold">
                <span className="text-on-surface">الإجمالي</span>
                <span className="text-primary">{order.total.toLocaleString("ar-SA")} ريال</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
            <h3 className="text-sm font-semibold text-on-surface mb-4">حالة الدفع</h3>
            <span
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium",
                order.payment_status === "paid"
                  ? "bg-emerald-50 text-emerald-700"
                  : order.payment_status === "failed"
                  ? "bg-red-50 text-red-700"
                  : "bg-yellow-50 text-yellow-700"
              )}
            >
              {order.payment_status === "paid" ? "مدفوع" : order.payment_status === "failed" ? "فشل" : "قيد الانتظار"}
            </span>
            {order.notes && (
              <div className="mt-4">
                <p className="text-xs text-on-surface-variant mb-1">ملاحظات</p>
                <p className="text-sm text-on-surface">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
