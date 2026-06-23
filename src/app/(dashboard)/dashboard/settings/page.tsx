"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Store, MessageCircle, CreditCard, Truck, Save, Loader2, CheckCircle2, XCircle, Plug, Wifi } from "lucide-react"

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
  const supabase = createClient()

  // WhatsApp connection state
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("")
  const [waAccessToken, setWaAccessToken] = useState("")
  const [waPhoneNumber, setWaPhoneNumber] = useState("")
  const [waWelcomeMessage, setWaWelcomeMessage] = useState("السلام عليكم! شكراً لتواصلك مع متجرنا. كيف يمكننا مساعدتك؟")
  const [waOrderMessage, setWaOrderMessage] = useState("تم استلام طلبك وسيتم التواصل معك قريباً لتأكيد التفاصيل. شكراً لطلبك!")
  const [waConnected, setWaConnected] = useState(false)
  const [waTesting, setWaTesting] = useState(false)
  const [waTestResult, setWaTestResult] = useState<"success" | "error" | null>(null)
  const [waTestMsg, setWaTestMsg] = useState("")
  const [waConnecting, setWaConnecting] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from("whatsapp_settings")
      .select("*")
      .single()
      .then(({ data }) => {
        if (data) {
          setWaPhoneNumberId(data.phone_number_id || "")
          setWaAccessToken(data.access_token || "")
          setWaPhoneNumber(data.phone_number || "")
          setWaWelcomeMessage(data.welcome_message || waWelcomeMessage)
          setWaOrderMessage(data.order_confirmation_message || waOrderMessage)
          setWaConnected(data.is_connected || false)
        }
      })
  }, [supabase])

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTestConnection() {
    if (!waPhoneNumberId || !waAccessToken) return
    setWaTesting(true)
    setWaTestResult(null)
    setWaTestMsg("")

    try {
      const res = await fetch("/api/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number_id: waPhoneNumberId, access_token: waAccessToken }),
      })
      const data = await res.json()
      setWaTestResult(data.valid ? "success" : "error")
      setWaTestMsg(data.message || "")
    } catch {
      setWaTestResult("error")
      setWaTestMsg("فشل الاتصال بالخادم")
    } finally {
      setWaTesting(false)
    }
  }

  async function handleConnect() {
    if (!waPhoneNumberId || !waAccessToken || !waPhoneNumber) return
    setWaConnecting(true)
    setWaTestResult(null)
    setWaTestMsg("")

    try {
      const res = await fetch("/api/whatsapp/register-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: waPhoneNumberId,
          access_token: waAccessToken,
          phone_number: waPhoneNumber,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setWaConnected(true)
        setWaTestResult("success")
        setWaTestMsg(data.message || "تم الربط بنجاح ✅")
      } else {
        setWaTestResult("error")
        setWaTestMsg(data.error || "فشل الربط")
      }
    } catch {
      setWaTestResult("error")
      setWaTestMsg("فشل الاتصال بالخادم")
    } finally {
      setWaConnecting(false)
    }
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">ربط واتساب</h3>
              {waConnected ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  متصل
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                  <XCircle className="h-4 w-4" />
                  غير متصل
                </span>
              )}
            </div>

            <p className="text-sm text-on-surface-variant">
              أدخل بيانات واتساب بزنس الخاصة بك لربط رقمك بالمنصة.
              تحتاج إلى حساب في <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Meta Developers</a>.
            </p>

            <div className="rounded-xl border border-outline-variant/30 bg-surface-container/20 p-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Phone Number ID</label>
                <input value={waPhoneNumberId} onChange={(e) => setWaPhoneNumberId(e.target.value)} dir="ltr" placeholder="123456789012345"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary font-mono" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Access Token (الدائم)</label>
                <input value={waAccessToken} onChange={(e) => setWaAccessToken(e.target.value)} dir="ltr" type="password" placeholder="EAAx..."
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary font-mono" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">رقم واتساب (مع مفتاح الدولة)</label>
                <input value={waPhoneNumber} onChange={(e) => setWaPhoneNumber(e.target.value)} dir="ltr" placeholder="+966500000000"
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>

              {/* Test + Connect buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={handleTestConnection} disabled={waTesting || !waPhoneNumberId || !waAccessToken}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors",
                    waTesting
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-surface-container text-on-surface border border-outline-variant/50 hover:bg-surface-container-hover"
                  )}>
                  {waTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
                  اختبار الاتصال
                </button>
                <button onClick={handleConnect} disabled={waConnecting || !waPhoneNumberId || !waAccessToken || !waPhoneNumber}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {waConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
                  {waConnecting ? "جاري الربط..." : "حفظ وربط"}
                </button>
              </div>

              {/* Test result */}
              {waTestResult && (
                <div className={cn(
                  "rounded-xl p-3 text-sm",
                  waTestResult === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                )}>
                  {waTestMsg}
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant/30 pt-5 space-y-4">
              <h4 className="font-bold text-on-surface">قوالب الرسائل</h4>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">رسالة الترحيب</label>
                <textarea value={waWelcomeMessage} onChange={(e) => setWaWelcomeMessage(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">رسالة تأكيد الطلب</label>
                <textarea value={waOrderMessage} onChange={(e) => setWaOrderMessage(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
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
