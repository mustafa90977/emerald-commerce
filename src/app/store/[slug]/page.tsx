import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTemplate } from "@/lib/templates"
import { StoreLayout } from "@/components/storefront/StoreLayout"
import { StoreHeader } from "@/components/storefront/StoreHeader"
import { ProductGrid } from "@/components/storefront/ProductGrid"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  if (!supabase) return { title: "المتجر" }

  const { data: store } = await supabase.from("stores").select("name, description").eq("slug", slug).single()
  if (!store) return { title: "المتجر" }

  return {
    title: store.name,
    description: store.description || `متجر ${store.name} على Emerald Commerce`,
    openGraph: { type: "website", locale: "ar_SA", siteName: store.name },
  }
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  if (!supabase) return notFound()

  const { data: store } = await supabase.from("stores").select("*").eq("slug", slug).single()
  if (!store) return notFound()

  const templateId = (store.settings as Record<string, unknown>)?.template as string || "emerald"
  const template = getTemplate(templateId)

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <StoreLayout template={template}>
      <StoreHeader template={template} name={store.name} logo={store.logo || undefined} description={store.description || undefined} />
      <ProductGrid products={products ?? []} template={template} />
    </StoreLayout>
  )
}
