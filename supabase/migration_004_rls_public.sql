-- Emerald Commerce - Public RLS Policies
-- Run this in Supabase SQL Editor

-- 1. Stores: public can read active stores
CREATE POLICY "stores_public_read" ON public.stores
  FOR SELECT USING (is_active = true);

-- 2. Products: public can read active products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND is_active = true)
  );

-- 3. Categories: public can read, merchants can manage their own
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_merchant_all" ON public.categories
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

-- 4. Customers: public can register, merchants manage own
CREATE POLICY "customers_public_insert" ON public.customers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND is_active = true)
  );

CREATE POLICY "customers_merchant_update" ON public.customers
  FOR UPDATE USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "customers_merchant_delete" ON public.customers
  FOR DELETE USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

-- 5. Orders: public can insert, merchants manage own
CREATE POLICY "orders_public_insert" ON public.orders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND is_active = true)
  );
