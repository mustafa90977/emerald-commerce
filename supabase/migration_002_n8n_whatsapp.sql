-- Emerald Commerce - n8n & WhatsApp Integration
-- Run this in Supabase SQL Editor after schema.sql

-- 1. WhatsApp Settings per merchant store
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

-- 2. WhatsApp messages log
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

-- 3. WhatsApp templates for message approval
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

-- 4. n8n webhook configurations per store
CREATE TABLE IF NOT EXISTS public.n8n_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN (
    'order.created',
    'order.updated',
    'order.status_changed',
    'customer.created',
    'customer.updated',
    'product.created',
    'support_ticket.created',
    'whatsapp.message_received',
    'whatsapp.message_status'
  )),
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  secret_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, event)
);

-- 5. n8n workflow execution log
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_store ON public.whatsapp_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_store ON public.whatsapp_messages(store_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_order ON public.whatsapp_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_store ON public.whatsapp_templates(store_id);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_store ON public.n8n_webhooks(store_id);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_event ON public.n8n_webhooks(event);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_store ON public.n8n_executions(store_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_created ON public.n8n_executions(executed_at DESC);

-- Updated_at triggers
CREATE TRIGGER update_whatsapp_settings_updated_at BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_n8n_webhooks_updated_at BEFORE UPDATE ON public.n8n_webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: merchants manage own; admins read all
CREATE POLICY "whatsapp_settings_merchant" ON public.whatsapp_settings
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
CREATE POLICY "whatsapp_settings_admin" ON public.whatsapp_settings
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE POLICY "whatsapp_messages_merchant" ON public.whatsapp_messages
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
CREATE POLICY "whatsapp_messages_admin" ON public.whatsapp_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE POLICY "whatsapp_templates_merchant" ON public.whatsapp_templates
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
CREATE POLICY "whatsapp_templates_admin" ON public.whatsapp_templates
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE POLICY "n8n_webhooks_merchant" ON public.n8n_webhooks
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
CREATE POLICY "n8n_webhooks_admin" ON public.n8n_webhooks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE POLICY "n8n_executions_merchant" ON public.n8n_executions
  FOR SELECT USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));
CREATE POLICY "n8n_executions_admin" ON public.n8n_executions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Service role bypass for n8n (service_role key bypasses RLS by default)
-- n8n will use service_role key to bypass RLS for automation
