"use client"

import { useEffect, useRef } from "react"
import { MessageCircle, ShoppingCart, BarChart3, Users, Settings, Shield } from "lucide-react"

const features = [
  {
    icon: MessageCircle,
    title: "تكامل واتساب المباشر",
    description: "ربط واتساب مباشرة مع متجرك، استقبل الطلبات والاستفسارات في مكان واحد.",
  },
  {
    icon: ShoppingCart,
    title: "إدارة الطلبات",
    description: "تتبع جميع الطلبات من الاستلام إلى التوصيل مع تحديث الحالة للعميل عبر واتساب.",
  },
  {
    icon: BarChart3,
    title: "تقارير وتحليلات",
    description: "إحصائيات المبيعات والمنتجات الأكثر مبيعاً مع رسوم بيانية تفاعلية.",
  },
  {
    icon: Users,
    title: "إدارة العملاء",
    description: "سجل شامل للعملاء مع تاريخ طلباتهم وإجمالي مشترياتهم.",
  },
  {
    icon: Settings,
    title: "إعدادات متكاملة",
    description: "تخصيص متجرك بالكامل: الشحن، الدفع، الضرائب، والرسائل التلقائية.",
  },
  {
    icon: Shield,
    title: "أمان واحترافية",
    description: "البيانات مشفرة، مع صلاحيات دقيقة للتجار والمشرفين على المنصة.",
  },
]

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("opacity-100", "translate-y-0")
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="features"
      ref={sectionRef}
      className="opacity-0 translate-y-8 transition-all duration-700 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">
            كل ما تحتاجه لإدارة متجرك
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            أدوات متكاملة لمساعدتك على نمو تجارتك عبر واتساب
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-outline-variant/50 bg-white p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/20 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-on-surface">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
