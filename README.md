# Emerald Commerce

منصة التجارة المحادثتية — إدارة متجرك الإلكتروني عبر واتساب.

## التقنيات

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (MD3 Design System)
- **Supabase** (Auth, Database, Storage)
- **Vercel** (نشر)

## البدء

```bash
npm install
npm run dev
```

## متغيرات البيئة

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## قاعدة البيانات

نفذ `supabase/schema.sql` في Supabase SQL Editor لإنشاء الجداول.

## الصفحات

| المسار | الصفحة |
|--------|--------|
| `/` | الصفحة الرئيسية |
| `/pricing` | الأسعار |
| `/login` | تسجيل الدخول |
| `/dashboard` | لوحة تحكم التاجر |
| `/dashboard/orders` | إدارة الطلبات |
| `/dashboard/products` | إدارة المنتجات |
| `/dashboard/customers` | إدارة العملاء |
| `/dashboard/reports` | التقارير |
| `/dashboard/settings` | إعدادات المتجر |
| `/dashboard/subscription` | الاشتراك |
| `/admin` | لوحة المشرف |
| `/admin/merchants` | إدارة التجار |
| `/admin/support` | الدعم الفني |
| `/admin/audit-log` | سجل العمليات |
| `/admin/settings` | إعدادات المنصة |
