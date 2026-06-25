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
export type PaymentStatus = "pending" | "partial" | "paid" | "failed" | "refunded"

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
  deposit_percentage: number
  deposit_amount: number
  deposit_paid: boolean
  deposit_paid_at: string | null
  remaining_amount: number
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

// ====== WhatsApp & n8n Integration Types ======

export type MessageDirection = "outbound" | "inbound"
export type MessageType = "text" | "template" | "image" | "interactive"
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "pending"
export type TemplateCategory = "marketing" | "utility" | "authentication"
export type TemplateStatus = "pending" | "approved" | "rejected" | "paused"

export interface WhatsAppSettings {
  id: string
  store_id: string
  phone_number: string
  phone_number_id: string
  business_account_id: string
  access_token: string
  webhook_verify_token: string
  welcome_message: string
  order_confirmation_message: string
  order_shipped_message: string
  is_connected: boolean
  created_at: string
  updated_at: string
}

export interface WhatsAppMessage {
  id: string
  store_id: string
  order_id?: string
  customer_id?: string
  direction: MessageDirection
  message_type: MessageType
  content: string
  template_name?: string
  wa_message_id?: string
  status: MessageStatus
  metadata: Record<string, unknown>
  created_at: string
}

export interface WhatsAppTemplate {
  id: string
  store_id: string
  name: string
  language: string
  category: TemplateCategory
  template_data: Record<string, unknown>
  meta_template_id?: string
  status: TemplateStatus
  created_at: string
  updated_at: string
}

export type N8nEvent =
  | "order.created"
  | "order.updated"
  | "order.status_changed"
  | "customer.created"
  | "customer.updated"
  | "product.created"
  | "support_ticket.created"
  | "whatsapp.message_received"
  | "whatsapp.message_status"
  | "deposit.paid"

export interface N8nWebhook {
  id: string
  store_id: string
  event: N8nEvent
  webhook_url: string
  is_active: boolean
  secret_token?: string
  created_at: string
  updated_at: string
}

export interface N8nExecution {
  id: string
  store_id: string
  workflow_name: string
  event: string
  payload: Record<string, unknown>
  response?: Record<string, unknown>
  status: "success" | "failed" | "pending"
  error_message?: string
  executed_at: string
}

export interface N8nWebhookPayload {
  event: N8nEvent
  store_id: string
  store_name?: string
  timestamp: string
  data: Record<string, unknown>
}

// ====== Payment Gateway & Deposit Types ======

export type PaymentProvider = "paymob" | "stripe" | "fawry"

export interface PaymentGateway {
  id: string
  store_id: string
  provider: PaymentProvider
  is_active: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  store_id: string
  order_id?: string
  provider: string
  transaction_id?: string
  intention_id?: string
  amount: number
  currency: string
  status: string
  type: "deposit" | "full" | "refund"
  provider_response?: Record<string, unknown>
  created_at: string
}
