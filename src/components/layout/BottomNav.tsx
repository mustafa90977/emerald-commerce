"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "الرئيسية", href: "/dashboard", icon: "home" },
  { label: "الطلبات", href: "/dashboard/orders", icon: "receipt_long" },
  { label: "المنتجات", href: "/dashboard/products", icon: "inventory_2" },
  { label: "الإعدادات", href: "/dashboard/settings", icon: "settings" },
]

const adminNavItems = [
  { label: "الرئيسية", href: "/admin", icon: "home" },
  { label: "التجار", href: "/admin/merchants", icon: "store" },
  { label: "التقارير", href: "/dashboard/reports", icon: "bar_chart" },
  { label: "الإعدادات", href: "/admin/settings", icon: "settings" },
]

export function BottomNav() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const items = isAdmin ? adminNavItems : navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/50 bg-surface-container md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
