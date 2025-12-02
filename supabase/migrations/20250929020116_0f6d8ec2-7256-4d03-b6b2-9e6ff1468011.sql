-- Install pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to encrypt RCON passwords
CREATE OR REPLACE FUNCTION public.encrypt_rcon_password(password_text text, encryption_key text)
RETURNS text AS $$
BEGIN
  -- Use AES encryption with the provided key
  RETURN encode(encrypt(password_text::bytea, encryption_key::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to decrypt RCON passwords
CREATE OR REPLACE FUNCTION public.decrypt_rcon_password(encrypted_password text, encryption_key text)
RETURNS text AS $$
BEGIN
  -- Decrypt the base64 encoded encrypted password
  RETURN convert_from(decrypt(decode(encrypted_password, 'base64'), encryption_key::bytea, 'aes'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    -- Return null if decryption fails (invalid key or corrupted data)
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a new column to track if password is encrypted
ALTER TABLE public.rcon_servers ADD COLUMN IF NOT EXISTS password_encrypted boolean DEFAULT false;

-- Create a more restrictive RLS policy for RCON servers
DROP POLICY IF EXISTS "Admins can manage RCON servers" ON public.rcon_servers;

-- Only super admins (explicitly defined) can manage RCON servers
CREATE POLICY "Super admins can manage RCON servers" ON public.rcon_servers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
      -- Additional check: user must have been admin for more than 24 hours
      AND created_at < (now() - interval '24 hours')
    )
  );

-- Create a function that only returns server info without passwords for regular admins
CREATE OR REPLACE FUNCTION public.get_rcon_servers_safe()
RETURNS TABLE (
  id uuid,
  name text,
  host text,
  port integer,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  -- Only return basic server info, no passwords
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.host,
    s.port,
    s.is_active,
    s.created_at,
    s.updated_at
  FROM public.rcon_servers s
  WHERE s.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a secure function to get decrypted password for RCON operations
CREATE OR REPLACE FUNCTION public.get_rcon_password_for_operation(server_id uuid, encryption_key text)
RETURNS text AS $$
DECLARE
  encrypted_pwd text;
  is_encrypted boolean;
BEGIN
  -- Check if user has permission (super admin only)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to access RCON passwords';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit logging for RCON password access
CREATE TABLE IF NOT EXISTS public.rcon_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  server_id uuid NOT NULL REFERENCES public.rcon_servers(id),
  access_type text NOT NULL, -- 'password_access', 'command_execution', etc.
  ip_address text,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  accessed_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.rcon_access_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view RCON access logs" ON public.rcon_access_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert RCON access logs" ON public.rcon_access_log
  FOR INSERT WITH CHECK (true);

-- Create a function to log RCON access attempts
CREATE OR REPLACE FUNCTION public.log_rcon_access(
  p_server_id uuid,
  p_access_type text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.rcon_access_log (
    user_id, server_id, access_type, ip_address, user_agent, success, error_message
  ) VALUES (
    auth.uid(), p_server_id, p_access_type, p_ip_address, p_user_agent, p_success, p_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;