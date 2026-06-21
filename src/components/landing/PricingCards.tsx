"use client"

import Link from "next/link"
import { useState } from "react"
import { ROUTES } from "@/lib/constants"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "الباقة المجانية",
    price: { monthly: 0, yearly: 0 },
    description: "للبدء والتجربة",
    features: [
      "منتجين",
      "١٠ طلبات شهرياً",
      "ربط واتساب",
      "لوحة تحكم بسيطة",
    ],
    cta: "ابدأ مجاناً",
    popular: false,
  },
  {
    name: "الباقة الاحترافية",
    price: { monthly: 199, yearly: 1999 },
    description: "للنمو والتوسع",
    features: [
      "منتجات غير محدودة",
      "طلبات غير محدودة",
      "ربط واتساب + إشعارات",
      "تقارير وتحليلات متقدمة",
      "إدارة العملاء",
      "دعم فني 24/7",
    ],
    cta: "اختر هذه الباقة",
    popular: true,
  },
  {
    name: "الباقة المتقدمة",
    price: { monthly: 399, yearly: 3999 },
    description: "للشركات الكبيرة",
    features: [
      "كل مميزات الاحترافية",
      "حسابات متعددة",
      "API مخصص",
      "نظام شحن متكامل",
      "بوابات دفع متعددة",
      "مدير حساب مخصص",
    ],
    cta: "اختر هذه الباقة",
    popular: false,
  },
]

export function PricingCards() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="bg-surface-container/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">
            خطط مرنة تناسب عملك
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            اختر الباقة المناسبة لاحتياجات متجرك
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={cn("text-sm font-medium", !yearly && "text-primary")}>شهري</span>
          <button
            onClick={() => setYearly(!yearly)}
            className={cn(
              "relative h-7 w-14 rounded-full transition-colors",
              yearly ? "bg-primary" : "bg-outline-variant"
            )}
          >
            <span
              className={cn(
                "absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-all",
                yearly ? "right-8" : "right-1"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium", yearly && "text-primary")}>
            سنوي
            <span className="mr-1 rounded-full bg-primary-container/30 px-2 py-0.5 text-xs text-primary">
              وفر حتى ٢٠٪
            </span>
          </span>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? plan.price.yearly : plan.price.monthly

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-8 transition-all hover:shadow-lg",
                  plan.popular
                    ? "border-primary shadow-md"
                    : "border-outline-variant/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                    الأكثر طلباً
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-on-surface">{plan.name}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{plan.description}</p>
                  <div className="mt-6">
                    {price === 0 ? (
                      <span className="text-4xl font-bold text-on-surface">مجاني</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-on-surface">{price.toLocaleString("ar-SA")}</span>
                        <span className="mr-1 text-sm text-on-surface-variant">
                          ريال / {yearly ? "سنوياً" : "شهرياً"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={ROUTES.LOGIN}
                  className={cn(
                    "mt-8 block rounded-xl py-3 text-center text-sm font-medium transition-all",
                    plan.popular
                      ? "bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg"
                      : "border border-primary text-primary hover:bg-primary hover:text-white"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
