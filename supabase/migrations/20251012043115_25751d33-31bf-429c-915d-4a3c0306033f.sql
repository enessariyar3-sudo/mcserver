-- Fix SECURITY DEFINER view issue
-- Drop and recreate the payment_gateways_public view with SECURITY INVOKER

DROP VIEW IF EXISTS public.payment_gateways_public;

-- Create view with SECURITY INVOKER (respects querying user's RLS policies)
CREATE VIEW public.payment_gateways_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  provider,
  is_active,
  is_default,
  created_at
FROM public.payment_gateways
WHERE is_active = TRUE;

-- Re-grant permissions
GRANT SELECT ON public.payment_gateways_public TO anon, authenticated;

-- Add RLS policy for the view
ALTER VIEW public.payment_gateways_public SET (security_invoker = true);

-- Add helpful comment
COMMENT ON VIEW public.payment_gateways_public IS 
  'Public view of active payment gateways with SECURITY INVOKER. 
   Shows only non-sensitive information (no config/secrets).
   Respects RLS policies of the querying user.';