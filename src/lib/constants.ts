export const ROUTES = {
  HOME: "/",
  PRICING: "/pricing",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ORDERS: "/dashboard/orders",
  PRODUCTS: "/dashboard/products",
  CUSTOMERS: "/dashboard/customers",
  REPORTS: "/dashboard/reports",
  SETTINGS: "/dashboard/settings",
  SUBSCRIPTION: "/dashboard/subscription",
  ADMIN: "/admin",
  ADMIN_MERCHANTS: "/admin/merchants",
  ADMIN_SUPPORT: "/admin/support",
  ADMIN_AUDIT_LOG: "/admin/audit-log",
  ADMIN_SETTINGS: "/admin/settings",
} as const

export const NAV_ITEMS = {
  public: [
    { label: "الرئيسية", href: ROUTES.HOME },
    { label: "المميزات", href: "/#features" },
    { label: "الأسعار", href: ROUTES.PRICING },
    { label: "لوحة التحكم", href: ROUTES.DASHBOARD },
  ],
  dashboard: [
    { label: "نظرة عامة", href: ROUTES.DASHBOARD, icon: "dashboard" },
    { label: "الطلبات", href: ROUTES.ORDERS, icon: "receipt_long" },
    { label: "المنتجات", href: ROUTES.PRODUCTS, icon: "inventory_2" },
    { label: "العملاء", href: ROUTES.CUSTOMERS, icon: "people" },
    { label: "التقارير", href: ROUTES.REPORTS, icon: "bar_chart" },
    { label: "الإعدادات", href: ROUTES.SETTINGS, icon: "settings" },
    { label: "الاشتراك", href: ROUTES.SUBSCRIPTION, icon: "credit_card" },
  ],
  admin: [
    { label: "نظرة عامة", href: ROUTES.ADMIN, icon: "dashboard" },
    { label: "التجار", href: ROUTES.ADMIN_MERCHANTS, icon: "store" },
    { label: "الدعم الفني", href: ROUTES.ADMIN_SUPPORT, icon: "support_agent" },
    { label: "سجل العمليات", href: ROUTES.ADMIN_AUDIT_LOG, icon: "history" },
    { label: "إعدادات المنصة", href: ROUTES.ADMIN_SETTINGS, icon: "settings" },
  ],
}

export const APP_NAME = "Emerald Commerce"
export const APP_DESCRIPTION = "منصة التجارة المحادثتية الأولى في الشرق الأوسط"

// ====== n8n & WhatsApp Integration ======

export const N8N_EVENTS = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_STATUS_CHANGED: "order.status_changed",
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",
  PRODUCT_CREATED: "product.created",
  SUPPORT_TICKET_CREATED: "support_ticket.created",
  WHATSAPP_MESSAGE_RECEIVED: "whatsapp.message_received",
  WHATSAPP_MESSAGE_STATUS: "whatsapp.message_status",
} as const

export const N8N_WEBHOOK_PATHS = {
  ORDER_CONFIRMATION: "/webhook/emerald-order-confirmation",
  NEW_CUSTOMER: "/webhook/emerald-new-customer",
  WHATSAPP_INCOMING: "/webhook/emerald-whatsapp-incoming",
} as const

export const WHATSAPP_ROUTES = {
  SEND: "/api/whatsapp/send",
  VERIFY: "/api/whatsapp/verify",
  REGISTER_WEBHOOK: "/api/whatsapp/register-webhook",
} as const

export const WHATSAPP_MESSAGE_TEMPLATES = {
  WELCOME: {
    name: "welcome_message",
    description: "رسالة الترحيب بالعميل الجديد",
  },
  ORDER_CONFIRMATION: {
    name: "order_confirmation_message",
    description: "رسالة تأكيد الطلب",
  },
  ORDER_SHIPPED: {
    name: "order_shipped_message",
    description: "رسالة إشعار الشحن",
  },
} as const
