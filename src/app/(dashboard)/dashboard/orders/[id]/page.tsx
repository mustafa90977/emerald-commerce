"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, Package, Truck, CheckCircle, XCircle, Clock, Loader2, MessageCircle, Percent, Copy, ExternalLink, Wallet } from "lucide-react"
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

  // Deposit state
  const [depositPct, setDepositPct] = useState(0)
  const [depositEnabled, setDepositEnabled] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [markingDeposit, setMarkingDeposit] = useState(false)
  const [paymentLink, setPaymentLink] = useState("")
  const [depositMsg, setDepositMsg] = useState("")
  const [depositMsgType, setDepositMsgType] = useState<"success" | "error" | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        const o = data as unknown as Order
        setOrder(o)
        if (o) {
          setDepositPct(o.deposit_percentage || 0)
          setDepositEnabled((o.deposit_percentage || 0) > 0)
        }
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

  async function handleSaveDepositPct() {
    const supabase = createClient()
    if (!supabase || !order) return

    const pct = depositEnabled ? depositPct : 0
    const total = Number(order.total)
    const depositAmount = Math.round((total * pct) / 100 * 100) / 100
    const remaining = Math.round((total - depositAmount) * 100) / 100

    await supabase.from("orders").update({
      deposit_percentage: pct,
      deposit_amount: depositAmount,
      remaining_amount: remaining,
    }).eq("id", id)

    setOrder({ ...order, deposit_percentage: pct, deposit_amount: depositAmount, remaining_amount: remaining })
    setDepositMsgType("success")
    setDepositMsg("تم حفظ النسبة ✅")
    setTimeout(() => { setDepositMsg(""); setDepositMsgType(null) }, 2000)
  }

  async function handleGenerateLink() {
    if (!order) return
    setGeneratingLink(true)
    setDepositMsg("")
    setDepositMsgType(null)

    try {
      const total = Number(order.total)
      const pct = depositEnabled ? depositPct : 0
      const depositAmount = Math.round((total * pct) / 100 * 100) / 100

      if (depositAmount <= 0) {
        setDepositMsg("الدفعة المقدمة يجب أن تكون أكبر من 0")
        setDepositMsgType("error")
        setGeneratingLink(false)
        return
      }

      const customer = (order as unknown as Record<string, unknown>).customer as Record<string, string> | undefined

      const res = await fetch("/api/payments/paymob/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          amount: depositAmount,
          customer_name: customer?.name || "",
          customer_email: customer?.email || "",
          customer_phone: customer?.phone || "",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setDepositMsg(data.error || "فشل إنشاء رابط الدفع")
        setDepositMsgType("error")
      } else {
        setPaymentLink(data.payment_link_url)
        setDepositMsg("تم إنشاء رابط الدفع بنجاح ✅")
        setDepositMsgType("success")
      }
    } catch {
      setDepositMsg("فشل الاتصال بالخادم")
      setDepositMsgType("error")
    } finally {
      setGeneratingLink(false)
    }
  }

  async function handleMarkDeposit() {
    if (!order) return
    setMarkingDeposit(true)

    try {
      const res = await fetch("/api/payments/mark-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, deposit_percentage: depositPct }),
      })

      if (res.ok) {
        setOrder({
          ...order,
          deposit_paid: true,
          deposit_paid_at: new Date().toISOString(),
          deposit_percentage: depositPct,
        })
        setDepositMsg("تم تأكيد استلام الدفعة المقدمة ✅")
        setDepositMsgType("success")
      } else {
        const data = await res.json()
        setDepositMsg(data.error || "فشل تأكيد الدفعة")
        setDepositMsgType("error")
      }
    } catch {
      setDepositMsg("فشل الاتصال بالخادم")
      setDepositMsgType("error")
    } finally {
      setMarkingDeposit(false)
    }
  }

  async function handleCopyLink() {
    if (!paymentLink) return
    try {
      await navigator.clipboard.writeText(paymentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { }
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
  const total = Number(order.total)
  const currentDepositAmount = order.deposit_amount || Math.round((total * depositPct) / 100 * 100) / 100
  const remaining = order.remaining_amount || Math.round((total - currentDepositAmount) * 100) / 100

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

          {/* Deposit section */}
          <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
            <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              الدفعة المقدمة (الديبوزت)
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-on-surface">طلب دفعة مقدمة</span>
                <input
                  type="checkbox"
                  checked={depositEnabled}
                  onChange={(e) => {
                    setDepositEnabled(e.target.checked)
                    if (!e.target.checked) setPaymentLink("")
                  }}
                  className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
              </label>

              {depositEnabled && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs text-on-surface-variant">النسبة (%)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={depositPct}
                        onChange={(e) => setDepositPct(Number(e.target.value))}
                        className="w-20 rounded-lg border border-outline-variant/50 px-3 py-1.5 text-sm outline-none focus:border-primary"
                      />
                      <span className="text-xs text-on-surface-variant">%</span>
                      <button
                        onClick={handleSaveDepositPct}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-surface-container/30 p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">إجمالي الطلب</span>
                      <span className="font-medium">{total.toLocaleString("ar-SA")} ريال</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>الدفعة المقدمة ({depositPct}%)</span>
                      <span className="font-bold">{currentDepositAmount.toLocaleString("ar-SA")} ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">المتبقي</span>
                      <span className="font-medium">{remaining.toLocaleString("ar-SA")} ريال</span>
                    </div>
                  </div>

                  {/* Payment link */}
                  {!order.deposit_paid && (
                    <button
                      onClick={handleGenerateLink}
                      disabled={generatingLink || currentDepositAmount <= 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {generatingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                      {generatingLink ? "جاري إنشاء الرابط..." : "🔄 توليد رابط دفع (Paymob)"}
                    </button>
                  )}

                  {paymentLink && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container/20 p-2">
                        <input
                          readOnly
                          value={paymentLink}
                          className="flex-1 bg-transparent text-xs font-mono outline-none"
                        />
                        <button onClick={handleCopyLink} className="shrink-0 rounded-lg p-1.5 hover:bg-surface-container">
                          {copied ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-on-surface-variant" />}
                        </button>
                        <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg p-1.5 hover:bg-surface-container">
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </a>
                      </div>
                      <p className="text-xs text-on-surface-variant">انسخ الرابط وأرسله للعميل عبر واتساب</p>
                    </div>
                  )}

                  {/* Manual mark deposit as paid */}
                  {!order.deposit_paid && (
                    <button
                      onClick={handleMarkDeposit}
                      disabled={markingDeposit || currentDepositAmount <= 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                    >
                      {markingDeposit ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      تأكيد استلام الدفعة المقدمة (يدوي)
                    </button>
                  )}
                </>
              )}

              {/* Deposit status badge */}
              {depositEnabled && (
                <div className={cn(
                  "flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-medium",
                  order.deposit_paid
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-yellow-50 text-yellow-700"
                )}>
                  {order.deposit_paid ? (
                    <><CheckCircle className="h-5 w-5" /> تم استلام الدفعة المقدمة ✅</>
                  ) : (
                    <><Clock className="h-5 w-5" /> في انتظار الدفعة المقدمة</>
                  )}
                </div>
              )}

              {depositMsg && (
                <div className={cn(
                  "rounded-xl p-3 text-sm",
                  depositMsgType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}>
                  {depositMsg}
                </div>
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
              {order.deposit_paid && Number(order.deposit_amount) > 0 && (
                <div className="border-t border-outline-variant/50 pt-3 flex justify-between text-sm">
                  <span className="text-on-surface-variant">المدفوع (ديبوزت)</span>
                  <span className="font-medium text-emerald-600">{Number(order.deposit_amount).toLocaleString("ar-SA")} ريال ✅</span>
                </div>
              )}
              {Number(order.remaining_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">المتبقي</span>
                  <span className="font-medium text-on-surface">{Number(order.remaining_amount).toLocaleString("ar-SA")} ريال</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
            <h3 className="text-sm font-semibold text-on-surface mb-4">حالة الدفع</h3>
            <span
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium",
                order.payment_status === "paid"
                  ? "bg-emerald-50 text-emerald-700"
                  : order.payment_status === "partial"
                  ? "bg-blue-50 text-blue-700"
                  : order.payment_status === "failed"
                  ? "bg-red-50 text-red-700"
                  : "bg-yellow-50 text-yellow-700"
              )}
            >
              {order.payment_status === "paid" ? "مدفوع بالكامل"
                : order.payment_status === "partial" ? "مدفوع جزئياً (ديبوزت)"
                : order.payment_status === "failed" ? "فشل"
                : "قيد الانتظار"}
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
