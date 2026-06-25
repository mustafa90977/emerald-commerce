-- ====== Migration 003: Deposit & Payment Gateway ======
-- Adds: deposit fields on orders, payment_gateways table, payment_transactions table

-- 1. Payment gateways (per merchant store)
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('paymob', 'stripe', 'fawry')),
  is_active BOOLEAN DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_gateways_store ON public.payment_gateways(store_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_provider ON public.payment_gateways(provider);

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own payment gateways"
  ON public.payment_gateways
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Merchants can insert their own payment gateways"
  ON public.payment_gateways
  FOR INSERT
  WITH CHECK (store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Merchants can update their own payment gateways"
  ON public.payment_gateways
  FOR UPDATE
  USING (store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Merchants can delete their own payment gateways"
  ON public.payment_gateways
  FOR DELETE
  USING (store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Payment transactions log
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  transaction_id TEXT,
  intention_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EGP',
  status TEXT NOT NULL DEFAULT 'pending',
  type TEXT NOT NULL DEFAULT 'deposit',
  provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_store ON public.payment_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON public.payment_transactions(order_id);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Service role can insert transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (true);

-- 3. Order deposit fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS deposit_percentage NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(10,2) DEFAULT 0;
