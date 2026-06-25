"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ROUTES } from "@/lib/constants"
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supabase) {
      setError("تعذر الاتصال بالخادم. تأكد من ضبط متغيرات البيئة.")
      setLoading(false)
      return
    }

    if (isSignup) {
      const res = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName: email.split("@")[0] }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل إنشاء الحساب")
        setLoading(false)
        return
      }
      setError("تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتفعيل.")
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "بيانات الدخول غير صحيحة"
        : authError.message)
      setLoading(false)
      return
    }

    router.push(ROUTES.DASHBOARD)
    router.refresh()
  }

  async function handleGoogleLogin() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface to-surface-container/50 px-4">
      <div className="w-full max-w-md">
          <div className="rounded-2xl border border-outline-variant/50 bg-white p-8 shadow-lg">
            <Link href="/" className="mb-4 flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
              <ArrowRight className="h-4 w-4" />
              العودة للرئيسية
            </Link>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <span className="text-xl font-bold text-white">E</span>
              </div>
            <h1 className="mt-4 text-2xl font-bold text-on-surface">
              {isSignup ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              {isSignup
                ? "أنشئ حسابك وابدأ متجرك المجاني"
                : "ادخل بيانات الدخول للوصول للوحة التحكم"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  required
                  className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-12 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-on-surface-variant">تذكرني</span>
                </label>
                <span className="text-sm text-primary cursor-pointer hover:underline">
                  نسيت كلمة المرور؟
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-on-error-container">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignup ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-on-surface-variant">أو</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/50 bg-white py-3 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              الدخول عبر Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            {isSignup ? "لديك حساب؟" : "ليس لديك حساب؟"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-medium text-primary hover:underline"
            >
              {isSignup ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
