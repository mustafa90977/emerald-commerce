"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "general", label: "عام" },
  { id: "plans", label: "الخطط والأسعار" },
  { id: "payment", label: "بوابات الدفع" },
  { id: "email", label: "البريد الإلكتروني" },
  { id: "maintenance", label: "الصيانة" },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await new Promise((r) => setTimeout(r, 500))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">إعدادات المنصة</h1>
        <p className="mt-1 text-sm text-on-surface-variant">إعدادات وتحكمات المنصة</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-white text-on-surface-variant border border-outline-variant/50 hover:border-primary/30 hover:text-primary"
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-outline-variant/50 bg-white p-6">
        {activeTab === "general" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">إعدادات عامة</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">اسم المنصة</label>
              <input defaultValue="Emerald Commerce"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">الوصف</label>
              <textarea defaultValue="منصة التجارة المحادثتية" rows={2}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">اللغة الافتراضية</label>
              <select className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option>العربية</option>
                <option>English</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === "plans" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">الخطط والأسعار</h3>
            {[
              { name: "مجاني", price: "٠ ريال" },
              { name: "أساسي", price: "٩٩ ريال/شهر" },
              { name: "احترافي", price: "١٩٩ ريال/شهر" },
              { name: "متقدم", price: "٣٩٩ ريال/شهر" },
            ].map((plan) => (
              <div key={plan.name} className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4">
                <span className="text-sm font-medium text-on-surface">{plan.name}</span>
                <span className="text-sm text-on-surface-variant">{plan.price}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">بوابات الدفع</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Stripe Secret Key</label>
              <input type="password" defaultValue="sk_live_..."
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Stripe Webhook Secret</label>
              <input type="password" defaultValue="whsec_..."
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" />
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">إعدادات البريد</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">SMTP Host</label>
              <input defaultValue="smtp.sendgrid.net"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Port</label>
                <input defaultValue="587"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Username</label>
                <input defaultValue="apikey"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Password</label>
              <input type="password" defaultValue="SG.xxxxx"
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" dir="ltr" />
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-on-surface">وضع الصيانة</h3>
            <label className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-on-surface">تفعيل وضع الصيانة</p>
                <p className="text-xs text-on-surface-variant mt-1">عند التفعيل، ستظهر رسالة الصيانة للزوار</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded text-primary" />
            </label>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">رسالة الصيانة</label>
              <textarea defaultValue="المنصة تحت الصيانة حالياً. سنعود قريباً!" rows={3}
                className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 border-t border-outline-variant/50 pt-6">
          <button onClick={handleSave}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
            حفظ الإعدادات
          </button>
          {saved && <span className="text-sm text-emerald-600">تم الحفظ</span>}
        </div>
      </div>
    </div>
  )
}
