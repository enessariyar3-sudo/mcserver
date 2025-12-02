-- Create rate limiting table for RCON password access
CREATE TABLE IF NOT EXISTS public.rcon_password_access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  server_id UUID NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on the table
ALTER TABLE public.rcon_password_access_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for system inserts
CREATE POLICY "System can insert password access attempts"
  ON public.rcon_password_access_attempts
  FOR INSERT
  WITH CHECK (true);

-- Create policy for admin viewing
CREATE POLICY "Admins can view password access attempts"
  ON public.rcon_password_access_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
  );

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rcon_password_access_user_time 
  ON public.rcon_password_access_attempts(user_id, attempted_at DESC);

-- Create function to check and enforce rate limiting
CREATE OR REPLACE FUNCTION public.check_rcon_password_rate_limit(
  p_user_id UUID,
  p_server_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_attempts INTEGER;
  max_attempts_per_minute INTEGER := 5;
  max_attempts_per_hour INTEGER := 20;
BEGIN
  -- Check attempts in last minute
  SELECT COUNT(*)
  INTO recent_attempts
  FROM public.rcon_password_access_attempts
  WHERE user_id = p_user_id
    AND attempted_at > now() - INTERVAL '1 minute';
  
  IF recent_attempts >= max_attempts_per_minute THEN
    RETURN FALSE;
  END IF;
  
  -- Check attempts in last hour
  SELECT COUNT(*)
  INTO recent_attempts
  FROM public.rcon_password_access_attempts
  WHERE user_id = p_user_id
    AND attempted_at > now() - INTERVAL '1 hour';
  
  IF recent_attempts >= max_attempts_per_hour THEN
    RETURN FALSE;
  END IF;
  
  -- Log this access attempt
  INSERT INTO public.rcon_password_access_attempts (user_id, server_id)
  VALUES (p_user_id, p_server_id);
  
  RETURN TRUE;
END;
$$;

-- Update the get_rcon_password_for_operation function to include rate limiting
CREATE OR REPLACE FUNCTION public.get_rcon_password_for_operation(server_id uuid, encryption_key text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  encrypted_pwd text;
  is_encrypted boolean;
  rate_limit_ok boolean;
BEGIN
  -- Check if user has permission (admin only)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to access RCON passwords';
  END IF;

  -- Check rate limiting
  SELECT public.check_rcon_password_rate_limit(auth.uid(), server_id)
  INTO rate_limit_ok;
  
  IF NOT rate_limit_ok THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before accessing RCON passwords again.';
  END IF;

  -- Get the password and encryption status
  SELECT password, password_encrypted 
  INTO encrypted_pwd, is_encrypted
  FROM public.rcon_servers 
  WHERE id = server_id AND is_active = true;

  IF encrypted_pwd IS NULL THEN
    RETURN NULL;
  END IF;

  -- If password is encrypted, decrypt it
  IF is_encrypted THEN
    RETURN public.decrypt_rcon_password(encrypted_pwd, encryption_key);
  ELSE
    -- Return plain text password (for backward compatibility during migration)
    RETURN encrypted_pwd;
  END IF;
END;
$$;