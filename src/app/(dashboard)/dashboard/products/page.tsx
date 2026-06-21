"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Package, Edit3, Trash2, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  compare_price: number | null
  stock: number
  category: string
  is_active: boolean
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: "", price: "", stock: "0", category: "" })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function fetchProducts() {
    if (!supabase) return
    let query = supabase.from("products").select("*").order("created_at", { ascending: false })
    if (search) query = query.ilike("name", `%${search}%`)
    const { data } = await query
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [search])

  async function handleSave() {
    if (!supabase || !form.name || !form.price) return
    setSaving(true)
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      category: form.category,
    }

    if (editProduct) {
      await supabase.from("products").update(payload).eq("id", editProduct.id)
    } else {
      await supabase.from("products").insert(payload)
    }

    setSaving(false)
    setShowForm(false)
    setEditProduct(null)
    setForm({ name: "", price: "", stock: "0", category: "" })
    fetchProducts()
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return
    if (!supabase) return
    await supabase.from("products").delete().eq("id", id)
    fetchProducts()
  }

  function openEdit(product: Product) {
    setEditProduct(product)
    setForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category ?? "",
    })
    setShowForm(true)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">المنتجات</h1>
          <p className="mt-1 text-sm text-on-surface-variant">إدارة منتجات متجرك</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setForm({ name: "", price: "", stock: "0", category: "" }); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          إضافة منتج
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن منتج..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus:border-primary"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">{editProduct ? "تعديل منتج" : "إضافة منتج"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">اسم المنتج</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">السعر (ريال)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">المخزون</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">التصنيف</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editProduct ? "حفظ التعديلات" : "إضافة المنتج"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/50 bg-white py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-on-surface-variant/50" />
          <p className="mt-4 text-on-surface-variant">لا توجد منتجات</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المنتج</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">السعر</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">المخزون</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">التصنيف</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-on-surface-variant">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container">
                        <Package className="h-5 w-5 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{product.name}</p>
                        <p className="text-xs text-on-surface-variant">{product.is_active ? "نشط" : "غير نشط"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{product.price.toLocaleString("ar-SA")} ريال</td>
                  <td className="px-6 py-4">
                    <span className={cn("text-sm", product.stock > 0 ? "text-on-surface" : "text-red-500")}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{product.category || "---"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(product)}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
