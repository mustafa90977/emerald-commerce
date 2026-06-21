import type { Metadata } from "next"
import { PricingCards } from "@/components/landing/PricingCards"

export const metadata: Metadata = {
  title: "الأسعار",
  description: "خطط مرنة تناسب عملك — اختر الباقة المناسبة لمتجرك",
}

export default function PricingPage() {
  return (
    <div className="py-12">
      <PricingCards />
    </div>
  )
}
