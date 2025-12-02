-- Fix critical security vulnerability in subscribers table
-- Remove overly permissive policy that allows any authenticated user to access subscriber data

-- Drop the dangerous policy that allows system-wide access
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.subscribers;

-- Drop existing view policies to rebuild with proper restrictions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;

-- Create secure policies with proper access control

-- Only service role (backend edge functions) can insert/update/delete subscriptions
-- This is for automated subscription management via Stripe webhooks
CREATE POLICY "Service role manages subscriptions"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view all subscription data for support and management
CREATE POLICY "Admins view all subscriptions"
ON public.subscribers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Users can ONLY view their own subscription (no insert/update/delete)
CREATE POLICY "Users view own subscription only"
ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add comment to document security requirements
COMMENT ON TABLE public.subscribers IS 'Contains sensitive payment data. Access restricted to: service role (for automation), admins (for support), and users (own data only).';