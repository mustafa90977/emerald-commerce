"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "ما هي منصة Emerald Commerce؟",
    a: "منصة متكاملة تمكن التجار من إنشاء متاجر إلكترونية تعمل عبر واتساب، مع أدوات لإدارة الطلبات والعملاء والمخزون.",
  },
  {
    q: "هل أحتاج إلى موقع إلكتروني؟",
    a: "لا. يمكنك بدء البيع فوراً عبر واتساب دون الحاجة إلى موقع إلكتروني. المنصة تولد متجراً رقمياً مرتبطاً برقم واتسابك.",
  },
  {
    q: "كيف يمكنني البدء؟",
    a: "سجل حساباً مجانياً، أضف منتجاتك، واربط رقم واتسابك. يمكنك البدء في البيع خلال دقائق.",
  },
  {
    q: "هل يمكنني تغيير باقتي لاحقاً؟",
    a: "نعم، يمكنك الترقية أو تخفيض باقتك في أي وقت. سيتم تطبيق التغيير من الشهر التالي.",
  },
  {
    q: "هل تدعمون الدفع الإلكتروني؟",
    a: "نعم، ندعم بوابات دفع متعددة مثل مدى، فيزا، ماستركارد، وآبل باي.",
  },
  {
    q: "هل يوجد دعم فني؟",
    a: "نعم، نوفر دعماً فنياً عبر واتساب والبريد الإلكتروني على مدار الساعة لجميع الباقات المدفوعة.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">
            الأسئلة الشائعة
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            إجابات لأكثر الأسئلة شيوعاً حول المنصة
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-right"
              >
                <span className="text-sm font-medium text-on-surface">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-on-surface-variant transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-outline-variant/50 px-6 py-4">
                    <p className="text-sm leading-relaxed text-on-surface-variant">{faq.a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
