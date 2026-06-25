import Link from "next/link"
import { ROUTES, APP_NAME } from "@/lib/constants"

const socialLinks = [
  { name: "Facebook", icon: "facebook" },
  { name: "Twitter", icon: "twitter" },
  { name: "Instagram", icon: "instagram" },
  { name: "LinkedIn", icon: "linkedin" },
]

const paymentMethods = [
  { name: "Visa", icon: "/images/visa.svg" },
  { name: "Mastercard", icon: "/images/mastercard.svg" },
  { name: "Mada", icon: "/images/mada.svg" },
  { name: "Apple Pay", icon: "/images/apple-pay.svg" },
]

export function Footer() {
  return (
    <footer className="border-t border-outline-variant/50 bg-surface-container">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-white">E</span>
              </div>
              <span className="text-lg font-semibold text-primary">{APP_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
              أول منصة تجارة محادثتية في الشرق الأوسط، تمكن التجار من إدارة متاجرهم عبر واتساب.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-on-surface">روابط سريعة</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href={ROUTES.HOME} className="text-sm text-on-surface-variant hover:text-primary">الرئيسية</Link></li>
              <li><Link href="/#features" className="text-sm text-on-surface-variant hover:text-primary">المميزات</Link></li>
              <li><Link href={ROUTES.PRICING} className="text-sm text-on-surface-variant hover:text-primary">الأسعار</Link></li>
              <li><Link href={ROUTES.LOGIN} className="text-sm text-on-surface-variant hover:text-primary">تسجيل الدخول</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-on-surface">قانوني</h3>
            <ul className="mt-4 space-y-2">
              <li><span className="text-sm text-on-surface-variant">الشروط والأحكام</span></li>
              <li><span className="text-sm text-on-surface-variant">سياسة الخصوصية</span></li>
              <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary">تواصل معنا</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-on-surface">وسائل الدفع</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex h-8 w-12 items-center justify-center rounded border border-outline-variant/50 bg-surface-container px-2 text-xs text-on-surface-variant"
                >
                  {method.name}
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-semibold text-on-surface">تابعنا</h3>
            <div className="mt-3 flex gap-3">
              {socialLinks.map((social) => (
                <span
                  key={social.name}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary hover:text-white"
                  title={social.name}
                >
                  <span className="text-sm">{social.icon[0].toUpperCase()}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-outline-variant/50 pt-6 text-center">
          <p className="text-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} {APP_NAME}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}
