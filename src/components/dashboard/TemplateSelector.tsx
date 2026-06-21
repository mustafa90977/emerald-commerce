"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { templates, type Template } from "@/lib/templates"
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"

export function TemplateSelector() {
  const supabase = createClient()
  const [currentTemplate, setCurrentTemplate] = useState("emerald")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) return; (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: profile } = await supabase.from("profiles").select("store_id").eq("id", user.id).single()
      if (!profile?.store_id) { setLoading(false); return }
      const { data: store } = await supabase.from("stores").select("settings").eq("id", profile.store_id).single()
      if (store?.settings && typeof store.settings === "object" && !Array.isArray(store.settings)) {
        const tmpl = (store.settings as Record<string, unknown>).template
        if (typeof tmpl === "string") setCurrentTemplate(tmpl)
      }
      setLoading(false)
    })()
  }, [supabase])

  async function selectTemplate(templateId: string) {
    if (!supabase) return; setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { data: profile } = await supabase.from("profiles").select("store_id").eq("id", user.id).single()
    if (!profile?.store_id) { setSaving(false); return }
    const { data: store } = await supabase.from("stores").select("settings").eq("id", profile.store_id).single()
    const settings = (store?.settings && typeof store.settings === "object" && !Array.isArray(store.settings))
      ? { ...store.settings, template: templateId }
      : { template: templateId }
    await supabase.from("stores").update({ settings }).eq("id", profile.store_id)
    setCurrentTemplate(templateId); setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-on-surface">شكل المتجر</h1>
        <p className="mt-1 text-sm text-on-surface-variant">اختر القالب المناسب لمتجرك</p>
      </div>

      {saving && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" /> جاري حفظ القالب...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <TemplateCard key={tpl.id} template={tpl} isActive={currentTemplate === tpl.id} onSelect={selectTemplate} saving={saving} />
        ))}
      </div>
    </div>
  )
}

function TemplateCard({ template, isActive, onSelect, saving }: { template: Template; isActive: boolean; onSelect: (id: string) => void; saving: boolean }) {
  const { colors, layout, radius } = template
  const isDark = colors.surface === "#1c1917" || colors.surface === "#0f172a" || colors.surface === "#020617"

  const headerHeight = layout.headerStyle === "minimal" ? "2.5rem" : "3.5rem"
  const cardWidth = "100%"

  return (
    <div
      onClick={() => !saving && onSelect(template.id)}
      className={cn(
        "cursor-pointer overflow-hidden rounded-2xl border-2 bg-white transition-all hover:shadow-lg",
        isActive ? "border-primary shadow-md" : "border-outline-variant/50 hover:border-primary/40"
      )}
      dir="ltr"
    >
      <div className="relative flex flex-col" style={{ minHeight: "240px" }}>
        <div style={{
          height: headerHeight,
          background: layout.headerStyle === "gradient" ? "linear-gradient(135deg, #ec4899, #8b5cf6)" :
            layout.headerStyle === "dark" || layout.headerStyle === "elegant" ? colors.headerBg : colors.cardBg,
          borderBottom: layout.headerStyle === "split" ? `1px solid ${colors.outline}` : "none",
          display: "flex", alignItems: "center", justifyContent: layout.headerStyle === "centered" ? "center" : "space-between",
          padding: "0 0.75rem",
          color: isDark ? "#fff" : colors.onSurface,
          gap: "0.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <div style={{
              width: "1.5rem", height: "1.5rem", borderRadius: "50%",
              background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center",
              color: colors.onPrimary, fontSize: "0.65rem", fontWeight: 700,
            }}>S</div>
            {layout.headerStyle !== "minimal" && (
              <span style={{ fontSize: "0.7rem", fontWeight: 600, whiteSpace: "nowrap" }}>متجري</span>
            )}
          </div>
          {layout.headerStyle !== "minimal" && layout.headerStyle !== "centered" && (
            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.55rem", opacity: 0.6 }}>
              <span>الرئيسية</span>
              <span>المنتجات</span>
            </div>
          )}
        </div>

        <div style={{
          flex: 1, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem",
          background: colors.background, direction: "rtl",
        }}>
          <div style={{
            width: "100%", height: "3rem", borderRadius: radius.card,
            background: colors.cardBg, border: layout.cardStyle !== "flat" && layout.cardStyle !== "shadow" && layout.cardStyle !== "elevated" ? `1px solid ${colors.cardBorder}` : "none",
            boxShadow: layout.cardStyle === "shadow" ? "0 2px 6px rgba(0,0,0,0.08)" : layout.cardStyle === "elevated" ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: layout.productImageShape === "circular" ? "50%" : radius.md, background: colors.surfaceVariant }} />
              <div>
                <div style={{ height: "0.4rem", width: "3rem", borderRadius: "2px", background: colors.onSurface, opacity: 0.3, marginBottom: "0.15rem" }} />
                <div style={{ height: "0.3rem", width: "2rem", borderRadius: "2px", background: colors.onSurfaceVariant, opacity: 0.2 }} />
              </div>
            </div>
            <div style={{
              width: "1.5rem", height: "0.7rem", borderRadius: radius.button,
              background: colors.primary, opacity: 0.4,
            }} />
          </div>
          <div style={{
            width: "60%", height: "3rem", borderRadius: radius.card,
            background: colors.cardBg, border: layout.cardStyle !== "flat" && layout.cardStyle !== "shadow" && layout.cardStyle !== "elevated" ? `1px solid ${colors.cardBorder}` : "none",
            boxShadow: layout.cardStyle === "shadow" ? "0 2px 6px rgba(0,0,0,0.08)" : layout.cardStyle === "elevated" ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: layout.productImageShape === "circular" ? "50%" : radius.md, background: colors.surfaceVariant }} />
              <div>
                <div style={{ height: "0.4rem", width: "2.5rem", borderRadius: "2px", background: colors.onSurface, opacity: 0.3, marginBottom: "0.15rem" }} />
                <div style={{ height: "0.3rem", width: "1.5rem", borderRadius: "2px", background: colors.onSurfaceVariant, opacity: 0.2 }} />
              </div>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      <div className="border-t border-outline-variant/30 p-3 text-right" style={{ direction: "rtl" }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-on-surface">{template.previewEmoji} {template.name}</h3>
            <p className="mt-0.5 text-xs text-on-surface-variant">{template.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
