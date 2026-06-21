"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ROUTES } from "@/lib/constants"
import { ArrowLeft, Play } from "lucide-react"

export function Hero() {
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
      ref={sectionRef}
      className="opacity-0 translate-y-8 transition-all duration-700"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-right">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-container/20 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              منصة التجارة المحادثتية الأولى
            </div>
            <h1 className="text-4xl font-bold leading-tight text-on-surface sm:text-5xl lg:text-6xl">
              حوّل واتساب إلى
              <span className="text-primary"> متجر إلكتروني </span>
              متكامل
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              أسهل طريقة لبيع منتجاتك عبر واتساب. إدارة الطلبات، العملاء،
              والمخزون من لوحة تحكم واحدة — كل شيء بدون مغادرة واتساب.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                ابدأ متجرك المجاني الآن
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-8 py-3.5 text-base font-medium text-on-surface transition-colors hover:bg-surface-container">
                <Play className="h-5 w-5 text-primary" />
                شاهد الفيديو
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-center lg:justify-start lg:text-right">
              <div>
                <p className="text-2xl font-bold text-primary">١٠٠٠+</p>
                <p className="text-sm text-on-surface-variant">تاجر نشط</p>
              </div>
              <div className="h-10 w-px bg-outline-variant/50" />
              <div>
                <p className="text-2xl font-bold text-primary">٥٠٠٠+</p>
                <p className="text-sm text-on-surface-variant">طلب شهرياً</p>
              </div>
              <div className="h-10 w-px bg-outline-variant/50" />
              <div>
                <p className="text-2xl font-bold text-primary">٩٨٪</p>
                <p className="text-sm text-on-surface-variant">رضا العملاء</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface to-surface-container shadow-xl">
              <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-8">
                <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">W</div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">متجر الأزياء</p>
                      <p className="text-xs text-on-surface-variant">متصل • ١٠ دقائق مضت</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg bg-surface-container p-3 text-sm">
                      السلام عليكم، أريد طلب شنطة يد بنية
                    </div>
                    <div className="mr-8 rounded-lg bg-primary p-3 text-sm text-white">
                      وعليكم السلام، متوفر حالياً بسعر ٢٥٠ ريال
                    </div>
                    <div className="rounded-lg bg-surface-container p-3 text-sm">
                      تمام، أريد طلبها مع الشحن للرياض
                    </div>
                    <div className="mr-8 rounded-lg bg-primary/90 p-3 text-sm text-white">
                      تم إنشاء الطلب ✓ الرقم: #ORD-2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
