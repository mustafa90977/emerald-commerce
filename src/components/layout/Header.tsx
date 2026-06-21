"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, ROUTES } from "@/lib/constants"
import { useSupabase } from "@/hooks/useSupabase"
import { useTheme } from "next-themes"
import { Menu, X, LogIn, Sun, Moon } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useSupabase()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-shadow duration-200",
        scrolled ? "bg-white/95 shadow-sm backdrop-blur-sm" : "bg-white"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-lg font-semibold text-primary">Emerald Commerce</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.public.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:block">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          {user ? (
            <Link
              href={ROUTES.DASHBOARD}
              className="hidden rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 md:block"
            >
              لوحة التحكم
            </Link>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="hidden items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 md:flex"
            >
              <LogIn className="h-4 w-4" />
              دخول
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-on-surface-variant hover:bg-surface-container md:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-outline-variant/50 bg-white md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.public.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary-container/20 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                )}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-outline-variant/50" />
            {user ? (
              <Link
                href={ROUTES.DASHBOARD}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-white"
              >
                لوحة التحكم
              </Link>
            ) : (
              <Link
                href={ROUTES.LOGIN}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-white"
              >
                تسجيل الدخول
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
