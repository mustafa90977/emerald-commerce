"use client"

import type { Template } from "@/lib/templates"

export function StoreHeader({ template, name, logo, description }: { template: Template; name: string; logo?: string; description?: string }) {
  const { colors, layout } = template
  const isDark = layout.headerStyle === "dark" || layout.headerStyle === "elegant"

  const bgGradient = layout.headerStyle === "gradient" ? "linear-gradient(135deg, #ec4899, #8b5cf6)" : undefined
  const bgColor = bgGradient ? undefined : colors.headerBg

  return (
    <header
      style={{
        background: bgGradient || bgColor,
        color: colors.headerText,
        borderBottom: layout.headerStyle === "elegant" ? `2px solid ${colors.primary}` : layout.headerStyle === "split" ? `1px solid ${colors.outline}` : "none",
        padding: layout.headerStyle === "minimal" ? "0.75rem 1rem" : layout.headerStyle === "elegant" ? "1rem 1rem" : "1rem",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1200px" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between" style={{
          gap: "0.5rem",
          textAlign: layout.headerStyle === "centered" ? "center" : undefined,
          ...(layout.headerStyle === "centered" ? { alignItems: "center" } : {}),
        }}>
          <div className="flex items-center gap-3">
            {logo && (
              <img src={logo} alt={name}
                className="shrink-0"
                style={{
                  width: layout.headerStyle === "elegant" ? "3rem" : "2rem",
                  height: layout.headerStyle === "elegant" ? "3rem" : "2rem",
                  borderRadius: layout.headerStyle === "minimal" ? "0" : "50%",
                  objectFit: "cover",
                  border: layout.headerStyle === "elegant" ? `2px solid ${colors.primary}` : "none",
                }}
              />
            )}
            <div className="min-w-0">
              <h1 className="truncate" style={{
                fontSize: layout.headerStyle === "dark" || layout.headerStyle === "elegant" ? "1.25rem" : "1.1rem",
                fontWeight: 700,
                letterSpacing: layout.headerStyle === "elegant" ? "0.05em" : "normal",
                margin: 0,
              }}>{name}</h1>
              {description && (
                <p className="truncate" style={{
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  margin: "0.125rem 0 0 0",
                  color: isDark ? "rgba(255,255,255,0.7)" : colors.onSurfaceVariant,
                }}>{description}</p>
              )}
            </div>
          </div>

          {layout.headerStyle !== "minimal" && layout.headerStyle !== "centered" && (
            <nav className="flex gap-4 md:gap-6 text-xs md:text-sm">
              <span style={{ cursor: "pointer", opacity: 0.9, borderBottom: `2px solid ${colors.headerText}`, paddingBottom: "2px" }}>الرئيسية</span>
              <span style={{ cursor: "pointer", opacity: 0.7 }}>المنتجات</span>
              <span style={{ cursor: "pointer", opacity: 0.7 }}>اتصل بنا</span>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
