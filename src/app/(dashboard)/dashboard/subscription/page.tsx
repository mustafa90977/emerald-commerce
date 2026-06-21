"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CreditCard, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PlanType } from "@/lib/types"

const plans: { key: PlanType; name: string; price: number; features: string[] }[] = [
  { key: "free", name: "مجاني", price: 0, features: ["منتجين", "١٠ طلبات شهرياً", "لوحة تحكم بسيطة"] },
  { key: "basic", name: "أساسي", price: 99, features: ["٢٠ منتج", "١٠٠ طلب شهرياً", "تقارير أساسية", "دعم فني"] },
  { key: "pro", name: "احترافي", price: 199, features: ["منتجات غير محدودة", "طلبات غير محدودة", "تقارير متقدمة", "دعم 24/7", "API"] },
  { key: "enterprise", name: "متقدم", price: 399, features: ["كل مميزات الاحترافية", "حسابات متعددة", "مدير حساب", "تكامل مخصص"] },
]

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free")
  const [status, setStatus] = useState("active")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    supabase.from("subscriptions").select("*").single().then(({ data }) => {
      if (data) {
        setCurrentPlan((data as { plan: PlanType }).plan)
        setStatus((data as { status: string }).status)
        setEndDate((data as { end_date: string }).end_date ?? "")
      }
      setLoading(false)
    })
  }, [])

  async function upgrade(plan: PlanType) {
    const supabase = createClient()
    if (!supabase) return
    setUpgrading(true)
    await supabase.from("subscriptions").update({ plan }).eq("plan", currentPlan)
    setCurrentPlan(plan)
    setUpgrading(false)
  }

  const daysLeft = endDate
    ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0
  const progress = endDate ? Math.min(100, Math.max(0, ((30 - daysLeft) / 30) * 100)) : 100

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">الاشتراك والفواتير</h1>
        <p className="mt-1 text-sm text-on-surface-variant">إدارة باقتك وفواتيرك</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-outline-variant/50 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">الباقة الحالية</p>
                <p className="text-2xl font-bold text-on-surface">
                  {plans.find((p) => p.key === currentPlan)?.name ?? "مجاني"}
                </p>
              </div>
              <div className={cn("rounded-xl px-4 py-2 text-sm font-medium",
                status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700")}>
                {status === "active" ? "نشط" : "منتهي"}
              </div>
            </div>
            {endDate && (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">{daysLeft} يوم متبقي</span>
                  <span className="text-on-surface-variant">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          <h3 className="mb-4 text-lg font-bold text-on-surface">خطط الأسعار</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const isCurrent = plan.key === currentPlan
              return (
                <div key={plan.key}
                  className={cn("flex flex-col rounded-2xl border bg-white p-5 transition-all hover:shadow-md",
                    isCurrent ? "border-primary shadow-sm" : "border-outline-variant/50")}>
                  <h4 className="text-lg font-bold text-on-surface">{plan.name}</h4>
                  <p className="mt-2">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-on-surface">مجاني</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-on-surface">{plan.price}</span>
                        <span className="mr-1 text-sm text-on-surface-variant">ريال/شهر</span>
                      </>
                    )}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => upgrade(plan.key)} disabled={isCurrent || upgrading}
                    className={cn("mt-5 rounded-xl py-2.5 text-center text-sm font-medium transition-all",
                      isCurrent
                        ? "bg-surface-container/50 text-on-surface-variant cursor-default"
                        : "bg-primary text-white hover:bg-primary/90 shadow-sm")}>
                    {upgrading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : isCurrent ? "باقتك الحالية" : "الترقية"}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
