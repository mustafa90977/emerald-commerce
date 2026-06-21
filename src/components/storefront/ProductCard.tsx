"use client"

import type { Product } from "@/lib/types"
import type { Template, CardStyle } from "@/lib/templates"

const cardStyles: Record<CardStyle, React.CSSProperties> = {
  bordered: { border: "1px solid var(--tpl-card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  shadow: { border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  elevated: { border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
  flat: { border: "1px solid var(--tpl-outline)", boxShadow: "none" },
  dark: { border: "1px solid var(--tpl-card-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", background: "var(--tpl-card-bg)" },
  colored: { border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", background: "var(--tpl-card-bg)" },
  gold: { border: "1.5px solid var(--tpl-card-border)", boxShadow: "0 2px 8px rgba(184,134,11,0.15)", background: "linear-gradient(135deg, var(--tpl-card-bg), #fefce8)" },
  sharp: { border: "1px solid var(--tpl-card-border)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)", borderRadius: 0 },
}

export function ProductCard({ product, template }: { product: Product; template: Template }) {
  const { layout, colors } = template

  return (
    <div style={{
      borderRadius: template.radius.card,
      background: layout.cardStyle === "dark" ? colors.cardBg : colors.cardBg,
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      ...cardStyles[layout.cardStyle],
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; if (layout.cardStyle !== "flat") e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)" }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; if (layout.cardStyle !== "flat") e.currentTarget.style.boxShadow = cardStyles[layout.cardStyle]?.boxShadow || "none" }}
    >
      <div style={{
        position: "relative",
        paddingTop: layout.productImageShape === "landscape" ? "56.25%" : layout.productImageShape === "square" ? "100%" : "100%",
        background: `linear-gradient(135deg, ${colors.surfaceVariant}, ${colors.cardBg})`,
        overflow: "hidden",
      }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              borderRadius: layout.productImageShape === "circular" ? "50%" : layout.productImageShape === "rounded" ? template.radius.md : 0,
              padding: layout.productImageShape === "circular" ? "1rem" : 0,
            }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.5rem", color: colors.onSurfaceVariant, opacity: 0.3,
          }}>
            🖼️
          </div>
        )}
      </div>

      <div style={{ padding: layout.cardStyle === "sharp" ? "0.75rem" : "1rem" }}>
        <h3 style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          margin: 0,
          color: colors.onSurface,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{product.name}</h3>

        {layout.showCategory && product.category && (
          <span style={{
            display: "inline-block",
            fontSize: "0.7rem",
            padding: "0.15rem 0.5rem",
            borderRadius: template.radius.badge,
            background: colors.badgeBg,
            color: colors.badgeText,
            marginTop: "0.35rem",
          }}>{product.category}</span>
        )}

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "0.5rem",
        }}>
          {layout.showPrice && (
            <span style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: colors.primary,
              direction: "ltr",
            }}>
              {product.price.toLocaleString("ar-SA")} ريال
            </span>
          )}
          {layout.showStock && (
            <span style={{
              fontSize: "0.75rem",
              color: product.stock > 0 ? colors.onSurfaceVariant : colors.error,
            }}>
              {product.stock > 0 ? `+${product.stock}` : "نفذ"}
            </span>
          )}
        </div>

        <button style={{
          width: "100%",
          marginTop: "0.75rem",
          padding: "0.5rem",
          borderRadius: template.radius.button,
          border: "none",
          background: colors.primary,
          color: colors.onPrimary,
          fontWeight: 600,
          fontSize: "0.8rem",
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9" }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
        >
          أطلب عبر واتساب
        </button>
      </div>
    </div>
  )
}
