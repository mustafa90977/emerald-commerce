export type Role = "merchant" | "admin" | "super_admin"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  phone: string
  avatar_url: string
  store_id: string
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  name: string
  slug: string
  logo: string
  description: string
  settings: Record<string, unknown>
  owner_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  compare_price: number
  images: string[]
  category: string
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface OrderItem {
  product_id: string
  name: string
  quantity: number
  price: number
  image: string
}

export interface Order {
  id: string
  store_id: string
  customer_id: string
  order_number: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  notes: string
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface Customer {
  id: string
  store_id: string
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  notes: string
  created_at: string
  updated_at: string
}

export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "urgent"

export interface TicketMessage {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
}

export interface SupportTicket {
  id: string
  store_id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  messages: TicketMessage[]
  created_at: string
  updated_at: string
}

export type PlanType = "free" | "basic" | "pro" | "enterprise"
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "expired"

export interface Subscription {
  id: string
  store_id: string
  plan: PlanType
  status: SubscriptionStatus
  start_date: string
  end_date: string
  stripe_subscription_id: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  resource_id: string
  details: Record<string, unknown>
  ip_address: string
  created_at: string
}
