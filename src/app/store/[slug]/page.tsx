import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAdminClient } from "@/lib/supabase/admin"
import { getTemplate } from "@/lib/templates"
import { StoreLayout } from "@/components/storefront/StoreLayout"
import { StoreHeader } from "@/components/storefront/StoreHeader"
import { ProductGrid } from "@/components/storefront/ProductGrid"

interface Props {
  params: Promise<{ slug: string }>
}

async function getStoreBySlug(slug: string) {
  const supabase = getAdminClient() as any
  if (!supabase) return null
  const { data } = await supabase.from("stores").select("*").eq("slug", slug).single()
  return data as Record<string, unknown> | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const store = await getStoreBySlug(slug)
  if (!store) return { title: "المتجر" }

  return {
    title: (store.name as string) || "المتجر",
    description: (store.description as string) || `متجر ${store.name} على Emerald Commerce`,
    openGraph: { type: "website", locale: "ar_SA", siteName: (store.name as string) || "المتجر" },
  }
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  const store = await getStoreBySlug(slug)
  if (!store) return notFound()

  const templateId = ((store.settings as Record<string, unknown>)?.template as string) || "emerald"
  const template = getTemplate(templateId)

  const supabase = getAdminClient() as any
  if (!supabase) return notFound()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <StoreLayout template={template}>
      <StoreHeader template={template} name={store.name as string} logo={(store.logo as string) || undefined} description={(store.description as string) || undefined} />
      <ProductGrid products={(products ?? []) as any} template={template} />
    </StoreLayout>
  )
}
