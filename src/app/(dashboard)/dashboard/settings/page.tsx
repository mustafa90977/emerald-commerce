"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Store, MessageCircle, CreditCard, Truck, Save, Loader2 } from "lucide-react"

const tabs = [
  { id: "general", label: "معلومات المتجر", icon: Store },
  { id: "whatsapp", label: "واتساب", icon: MessageCircle },
  { id: "payment", label: "بوابات الدفع", icon: CreditCard },
  { id: "shipping", label: "الشحن", icon: Truck },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">الإعدادات</h1>
        <p className="mt-1 text-sm text-on-surface-variant">إعدادات متجرك وتخصيصاته</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white text-on-surface-variant border border-outline-variant/50 hover:border-primary/30 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
        {activeTab === "general" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">معلومات المتجر</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">اسم المتجر</label>
              <input defaultValue="متجري" className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">وصف المتجر</label>
              <textarea defaultValue="متجر إلكتروني متكامل" rows={3}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">رابط المتجر</label>
              <div className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container/30 px-4 py-2.5 text-sm text-on-surface-variant"
                dir="ltr">
                <span>https://emerald.store/</span>
                <input defaultValue="my-store" className="bg-transparent outline-none text-on-surface flex-1" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">إعدادات واتساب</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">رقم واتساب</label>
              <input defaultValue="+966500000000" dir="ltr"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">رسالة الترحيب</label>
              <textarea defaultValue="السلام عليكم! شكراً لتواصلك مع متجرنا. كيف يمكننا مساعدتك؟" rows={3}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">رسالة تأكيد الطلب</label>
              <textarea defaultValue="تم استلام طلبك وسيتم التواصل معك قريباً لتأكيد التفاصيل. شكراً لطلبك!" rows={3}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">بوابات الدفع</h3>
            {["مدى", "فيزا/ماستركارد", "آبل باي", "Stripe"].map((method) => (
              <label key={method} className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4 cursor-pointer hover:bg-surface-container/30">
                <span className="text-sm font-medium text-on-surface">{method}</span>
                <input type="checkbox" defaultChecked={method !== "Stripe"}
                  className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary" />
              </label>
            ))}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">مفتاح Stripe (اختياري)</label>
              <input defaultValue="sk_live_..." dir="ltr"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">إعدادات الشحن</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">المناطق المشمولة</label>
              <input defaultValue="جميع مناطق المملكة"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">قيمة الشحن (ريال)</label>
                <input type="number" defaultValue="25"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">الشحن المجاني عند</label>
                <input type="number" defaultValue="200"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">شركات الشحن</label>
              <div className="flex flex-wrap gap-2">
                {["SMSA", "أرامكس", "دي إتش إل", "فيديكس"].map((c) => (
                  <label key={c} className="flex items-center gap-2 rounded-lg border border-outline-variant/50 px-3 py-2 cursor-pointer hover:bg-surface-container/30">
                    <input type="checkbox" defaultChecked={c === "SMSA"} className="h-4 w-4 text-primary" />
                    <span className="text-sm">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 border-t border-outline-variant/50 pt-6">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الإعدادات
          </button>
          {saved && <span className="text-sm text-emerald-600">تم الحفظ بنجاح</span>}
        </div>
      </div>
    </div>
  )
}
