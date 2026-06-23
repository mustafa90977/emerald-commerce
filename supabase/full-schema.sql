-- ============================================
-- Emerald Commerce - Full Database Schema
-- تشغيل مرة واحدة فقط في SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Stores ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  description TEXT,
  settings JSONB DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Profiles ────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('merchant', 'admin', 'super_admin')) DEFAULT 'merchant',
  phone TEXT,
  avatar_url TEXT,
  store_id UUID REFERENCES public.stores(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Categories ──────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Products ────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Customers ───────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Orders ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('pending','paid','failed','refunded')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. Support Tickets ─────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT CHECK (status IN ('open','in_progress','waiting','resolved','closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. Subscriptions ───────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
  plan TEXT CHECK (plan IN ('free','basic','pro','enterprise')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active','canceled','past_due','expired')) DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. Audit Logs ──────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. Platform Settings (admin) ──────────
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. Notifications ──────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 12. WhatsApp Settings ─────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT,
  phone_number_id TEXT,
  business_account_id TEXT,
  access_token TEXT,
  webhook_verify_token TEXT,
  welcome_message TEXT DEFAULT 'السلام عليكم! مرحباً بك في متجرنا 🎉',
  order_confirmation_message TEXT DEFAULT 'تم استلام طلبك رقم {{order_number}} وسنقوم بتجهيزه قريباً ✅',
  order_shipped_message TEXT DEFAULT 'تم شحن طلبك رقم {{order_number}} 🚚',
  is_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 13. WhatsApp Messages ─────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  direction TEXT CHECK (direction IN ('outbound', 'inbound')) NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'template', 'image', 'interactive')) DEFAULT 'text',
  content TEXT NOT NULL,
  template_name TEXT,
  wa_message_id TEXT,
  status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'pending')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 14. WhatsApp Templates ────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT DEFAULT 'ar',
  category TEXT CHECK (category IN ('marketing', 'utility', 'authentication')) DEFAULT 'utility',
  template_data JSONB NOT NULL,
  meta_template_id TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'paused')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 15. n8n Webhooks ──────────────────────
CREATE TABLE IF NOT EXISTS public.n8n_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN (
    'order.created', 'order.updated', 'order.status_changed',
    'customer.created', 'customer.updated', 'product.created',
    'support_ticket.created', 'whatsapp.message_received', 'whatsapp.message_status'
  )),
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  secret_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, event)
);

-- ── 16. n8n Executions ────────────────────
CREATE TABLE IF NOT EXISTS public.n8n_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  event TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  response JSONB,
  status TEXT CHECK (status IN ('success', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add extra columns to support_tickets ───
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- ── Toggle merchant store function ─────────
CREATE OR REPLACE FUNCTION toggle_merchant_store(merchant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_status BOOLEAN;
BEGIN
  SELECT is_active INTO current_status FROM public.stores WHERE owner_id = merchant_id;
  UPDATE public.stores SET is_active = NOT current_status WHERE owner_id = merchant_id;
  RETURN NOT current_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Indexes ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers(store_id);
CREATE INDEX IF NOT EXISTS idx_tickets_store ON public.support_tickets(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_store ON public.whatsapp_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_store ON public.whatsapp_messages(store_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_order ON public.whatsapp_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_store ON public.whatsapp_templates(store_id);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_store ON public.n8n_webhooks(store_id);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_event ON public.n8n_webhooks(event);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_store ON public.n8n_executions(store_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_created ON public.n8n_executions(executed_at DESC);

-- ── Updated_at trigger function ────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Apply triggers ─────────────────────────
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_whatsapp_settings_updated_at ON public.whatsapp_settings;
CREATE TRIGGER update_whatsapp_settings_updated_at BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_whatsapp_templates_updated_at ON public.whatsapp_templates;
CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_n8n_webhooks_updated_at ON public.n8n_webhooks;
CREATE TRIGGER update_n8n_webhooks_updated_at BEFORE UPDATE ON public.n8n_webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Audit log trigger function ─────────────
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource, resource_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object(
      'old', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      'new', CASE WHEN TG_OP = 'INSERT' THEN row_to_json(NEW) ELSE NULL END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Row Level Security ─────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_executions ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ───────────────────────────

-- Profiles
DROP POLICY IF EXISTS "profiles_self" ON public.profiles;
CREATE POLICY "profiles_self" ON public.profiles
  FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;
CREATE POLICY "profiles_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Stores
DROP POLICY IF EXISTS "stores_owner" ON public.stores;
CREATE POLICY "stores_owner" ON public.stores
  FOR ALL USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "stores_admin" ON public.stores;
CREATE POLICY "stores_admin" ON public.stores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Products
DROP POLICY IF EXISTS "products_merchant" ON public.products;
CREATE POLICY "products_merchant" ON public.products
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "products_admin" ON public.products;
CREATE POLICY "products_admin" ON public.products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Orders
DROP POLICY IF EXISTS "orders_merchant" ON public.orders;
CREATE POLICY "orders_merchant" ON public.orders
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "orders_admin" ON public.orders;
CREATE POLICY "orders_admin" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Customers
DROP POLICY IF EXISTS "customers_merchant" ON public.customers;
CREATE POLICY "customers_merchant" ON public.customers
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "customers_admin" ON public.customers;
CREATE POLICY "customers_admin" ON public.customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Support Tickets
DROP POLICY IF EXISTS "support_merchant" ON public.support_tickets;
CREATE POLICY "support_merchant" ON public.support_tickets
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "support_admin" ON public.support_tickets;
CREATE POLICY "support_admin" ON public.support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Subscriptions
DROP POLICY IF EXISTS "subscriptions_merchant" ON public.subscriptions;
CREATE POLICY "subscriptions_merchant" ON public.subscriptions
  FOR SELECT USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "subscriptions_admin" ON public.subscriptions;
CREATE POLICY "subscriptions_admin" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Audit Logs
DROP POLICY IF EXISTS "audit_logs_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_admin" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Platform Settings
DROP POLICY IF EXISTS "platform_settings_admin" ON public.platform_settings;
CREATE POLICY "platform_settings_admin" ON public.platform_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );
DROP POLICY IF EXISTS "platform_settings_read" ON public.platform_settings;
CREATE POLICY "platform_settings_read" ON public.platform_settings
  FOR SELECT USING (true);

-- Notifications
DROP POLICY IF EXISTS "notifications_admin" ON public.notifications;
CREATE POLICY "notifications_admin" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- WhatsApp Settings
DROP POLICY IF EXISTS "whatsapp_settings_merchant" ON public.whatsapp_settings;
CREATE POLICY "whatsapp_settings_merchant" ON public.whatsapp_settings
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "whatsapp_settings_admin" ON public.whatsapp_settings;
CREATE POLICY "whatsapp_settings_admin" ON public.whatsapp_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- WhatsApp Messages
DROP POLICY IF EXISTS "whatsapp_messages_merchant" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_messages_merchant" ON public.whatsapp_messages
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "whatsapp_messages_admin" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_messages_admin" ON public.whatsapp_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- WhatsApp Templates
DROP POLICY IF EXISTS "whatsapp_templates_merchant" ON public.whatsapp_templates;
CREATE POLICY "whatsapp_templates_merchant" ON public.whatsapp_templates
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "whatsapp_templates_admin" ON public.whatsapp_templates;
CREATE POLICY "whatsapp_templates_admin" ON public.whatsapp_templates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- n8n Webhooks
DROP POLICY IF EXISTS "n8n_webhooks_merchant" ON public.n8n_webhooks;
CREATE POLICY "n8n_webhooks_merchant" ON public.n8n_webhooks
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "n8n_webhooks_admin" ON public.n8n_webhooks;
CREATE POLICY "n8n_webhooks_admin" ON public.n8n_webhooks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- n8n Executions
DROP POLICY IF EXISTS "n8n_executions_merchant" ON public.n8n_executions;
CREATE POLICY "n8n_executions_merchant" ON public.n8n_executions
  FOR SELECT USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "n8n_executions_admin" ON public.n8n_executions;
CREATE POLICY "n8n_executions_admin" ON public.n8n_executions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );
