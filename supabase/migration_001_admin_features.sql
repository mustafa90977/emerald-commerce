-- Emerald Commerce - Admin features migration
-- Run after schema.sql

-- Platform settings (key-value store for admin panel)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_settings_admin" ON public.platform_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

CREATE POLICY "platform_settings_read" ON public.platform_settings
  FOR SELECT USING (true);

-- Add store_name and store_logo to support_tickets for display
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Notification subscriptions table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_admin" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- Add toggle_active function for merchants
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
