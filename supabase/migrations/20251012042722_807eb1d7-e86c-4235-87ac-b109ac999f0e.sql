-- Fix Critical Security Issue: Payment Gateway Secrets Exposure
-- Remove public access to payment gateway configuration

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Everyone can view active payment gateways" ON public.payment_gateways;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can view payment gateways"
  ON public.payment_gateways FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add comment documenting that secrets should NEVER be stored in config
COMMENT ON COLUMN public.payment_gateways.config IS 
  'SECURITY: Store only non-sensitive configuration here (e.g., currency, region). 
   API keys and secrets MUST be stored in Supabase Secrets (environment variables).
   Access secrets server-side via edge functions only.';

-- Create a view for public payment gateway info (no sensitive data)
CREATE OR REPLACE VIEW public.payment_gateways_public AS
SELECT 
  id,
  name,
  provider,
  is_active,
  is_default,
  created_at
FROM public.payment_gateways
WHERE is_active = TRUE;

-- Allow public to view the safe view
GRANT SELECT ON public.payment_gateways_public TO anon, authenticated;

-- Enhance RCON password rate limiting - add additional security
-- Update the check_rcon_password_rate_limit function to be more strict
CREATE OR REPLACE FUNCTION public.check_rcon_password_rate_limit(p_user_id uuid, p_server_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_attempts INTEGER;
  max_attempts_per_minute INTEGER := 3;  -- Reduced from 5 to 3
  max_attempts_per_hour INTEGER := 10;   -- Reduced from 20 to 10
  max_attempts_per_day INTEGER := 50;    -- New daily limit
BEGIN
  -- Check attempts in last minute
  SELECT COUNT(*)
  INTO recent_attempts
  FROM public.rcon_password_access_attempts
  WHERE user_id = p_user_id
    AND attempted_at > now() - INTERVAL '1 minute';
  
  IF recent_attempts >= max_attempts_per_minute THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many password access attempts. Please wait 1 minute.';
  END IF;
  
  -- Check attempts in last hour
  SELECT COUNT(*)
  INTO recent_attempts
  FROM public.rcon_password_access_attempts
  WHERE user_id = p_user_id
    AND attempted_at > now() - INTERVAL '1 hour';
  
  IF recent_attempts >= max_attempts_per_hour THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many password access attempts in the last hour. Please wait.';
  END IF;
  
  -- Check attempts in last 24 hours (new)
  SELECT COUNT(*)
  INTO recent_attempts
  FROM public.rcon_password_access_attempts
  WHERE user_id = p_user_id
    AND attempted_at > now() - INTERVAL '24 hours';
  
  IF recent_attempts >= max_attempts_per_day THEN
    RAISE EXCEPTION 'Rate limit exceeded: Daily password access limit reached. Please contact support.';
  END IF;
  
  -- Log this access attempt
  INSERT INTO public.rcon_password_access_attempts (user_id, server_id)
  VALUES (p_user_id, p_server_id);
  
  RETURN TRUE;
END;
$$;

-- Add enhanced logging to get_rcon_password_for_operation
CREATE OR REPLACE FUNCTION public.get_rcon_password_for_operation(server_id uuid, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_pwd text;
  is_encrypted boolean;
  rate_limit_ok boolean;
  server_name text;
BEGIN
  -- Check if user has permission (admin only with 24-hour requirement)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
    AND created_at < NOW() - INTERVAL '24 hours'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions: Admin role required for at least 24 hours to access RCON passwords';
  END IF;

  -- Get server name for logging
  SELECT name INTO server_name
  FROM public.rcon_servers 
  WHERE id = server_id AND is_active = true;

  IF server_name IS NULL THEN
    RAISE EXCEPTION 'Server not found or inactive';
  END IF;

  -- Check rate limiting (this also logs the attempt)
  SELECT public.check_rcon_password_rate_limit(auth.uid(), server_id)
  INTO rate_limit_ok;

  -- Get the password and encryption status
  SELECT password, password_encrypted 
  INTO encrypted_pwd, is_encrypted
  FROM public.rcon_servers 
  WHERE id = server_id AND is_active = true;

  IF encrypted_pwd IS NULL THEN
    RAISE EXCEPTION 'RCON password not configured for this server';
  END IF;

  -- Enhanced audit log
  INSERT INTO public.rcon_access_log (
    user_id, 
    server_id, 
    access_type, 
    success,
    ip_address
  ) VALUES (
    auth.uid(),
    server_id,
    'password_decryption',
    true,
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );

  -- If password is encrypted, decrypt it
  IF is_encrypted THEN
    RETURN public.decrypt_rcon_password(encrypted_pwd, encryption_key);
  ELSE
    -- Return plain text password (for backward compatibility during migration)
    RETURN encrypted_pwd;
  END IF;
END;
$$;