import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { PricingCards } from "@/components/landing/PricingCards"
import { FAQ } from "@/components/landing/FAQ"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <PricingCards />
      <FAQ />
    </>
  )
}
