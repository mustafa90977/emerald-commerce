"use client"

import type { Product } from "@/lib/types"
import type { Template } from "@/lib/templates"
import { ProductCard } from "./ProductCard"

export function ProductGrid({ products, template }: { products: Product[]; template: Template }) {
  return (
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem 1rem",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${template.layout.gridCols}, 1fr)`,
        gap: template.layout.cardStyle === "elevated" ? "2rem" : "1.25rem",
      }}
        className="responsive-grid"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} template={template} />
        ))}
      </div>

      {products.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "4rem 1rem",
          color: template.colors.onSurfaceVariant,
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📦</div>
          <p>لا توجد منتجات حالياً</p>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .responsive-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .responsive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
