"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ROUTES, APP_NAME } from "@/lib/constants"
import {
  LayoutDashboard,
  Store,
  HeadphonesIcon,
  History,
  Settings,
  LogOut,
} from "lucide-react"

const sidebarItems = [
  { label: "نظرة عامة", href: ROUTES.ADMIN, icon: LayoutDashboard },
  { label: "التجار", href: ROUTES.ADMIN_MERCHANTS, icon: Store },
  { label: "الدعم الفني", href: ROUTES.ADMIN_SUPPORT, icon: HeadphonesIcon },
  { label: "سجل العمليات", href: ROUTES.ADMIN_AUDIT_LOG, icon: History },
  { label: "إعدادات المنصة", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="fixed right-0 top-0 z-30 hidden h-full w-72 flex-col border-l border-outline-variant/50 bg-surface-container md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-outline-variant/50 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-white">E</span>
        </div>
        <span className="text-lg font-semibold text-primary">{APP_NAME}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium text-on-surface-variant">لوحة المشرف</p>
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== ROUTES.ADMIN && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-outline-variant/50 p-3">
        <button
          onClick={() => router.push("/auth/logout")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
