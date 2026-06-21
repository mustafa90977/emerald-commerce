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
        padding: layout.headerStyle === "minimal" ? "1rem 2rem" : layout.headerStyle === "elegant" ? "1.5rem 2rem" : "1.25rem 2rem",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1200px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: layout.headerStyle === "centered" ? "center" : "space-between",
          flexDirection: layout.headerStyle === "centered" ? "column" : "row",
          gap: "0.5rem",
          textAlign: layout.headerStyle === "centered" ? "center" : undefined,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {logo && (
              <img src={logo} alt={name}
                style={{
                  width: layout.headerStyle === "elegant" ? "3.5rem" : "2.5rem",
                  height: layout.headerStyle === "elegant" ? "3.5rem" : "2.5rem",
                  borderRadius: layout.headerStyle === "minimal" ? "0" : "50%",
                  objectFit: "cover",
                  border: layout.headerStyle === "elegant" ? `2px solid ${colors.primary}` : "none",
                }}
              />
            )}
            <div>
              <h1 style={{
                fontSize: layout.headerStyle === "dark" || layout.headerStyle === "elegant" ? "1.75rem" : "1.25rem",
                fontWeight: 700,
                letterSpacing: layout.headerStyle === "elegant" ? "0.05em" : "normal",
                margin: 0,
              }}>{name}</h1>
              {description && (
                <p style={{
                  fontSize: "0.875rem",
                  opacity: 0.8,
                  margin: "0.25rem 0 0 0",
                  color: isDark ? "rgba(255,255,255,0.7)" : colors.onSurfaceVariant,
                }}>{description}</p>
              )}
            </div>
          </div>

          {layout.headerStyle !== "minimal" && layout.headerStyle !== "centered" && (
            <nav style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem" }}>
              <span style={{ cursor: "pointer", opacity: 0.9, borderBottom: `2px solid ${colors.headerText}` }}>الرئيسية</span>
              <span style={{ cursor: "pointer", opacity: 0.7 }}>المنتجات</span>
              <span style={{ cursor: "pointer", opacity: 0.7 }}>اتصل بنا</span>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
