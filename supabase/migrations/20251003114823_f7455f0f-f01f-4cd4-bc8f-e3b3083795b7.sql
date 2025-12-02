-- Fix critical security vulnerability in payment_transactions table
-- Remove overly permissive system policies that allow any authenticated user to insert/update

-- Drop the dangerous policies with USING (true)
DROP POLICY IF EXISTS "System can insert transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON public.payment_transactions;

-- Keep existing view policies (they are secure)
-- "Admins can view all transactions" - already secure
-- "Users can view their own transactions" - already secure

-- Create secure policies restricted to service role only
-- Only backend edge functions (with service role) can insert transactions
CREATE POLICY "Service role inserts transactions"
ON public.payment_transactions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only backend edge functions (with service role) can update transactions
CREATE POLICY "Service role updates transactions"
ON public.payment_transactions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Add comment to document security requirements
COMMENT ON TABLE public.payment_transactions IS 'Contains sensitive payment data including customer emails, Stripe payment intent IDs, and transaction amounts. INSERT/UPDATE restricted to service role only. SELECT allowed for admins (all records) and users (own records only).';