-- Fix function search path security warnings by setting explicit search_path
CREATE OR REPLACE FUNCTION public.encrypt_rcon_password(password_text text, encryption_key text)
RETURNS text AS $$
BEGIN
  -- Use AES encryption with the provided key
  RETURN encode(encrypt(password_text::bytea, encryption_key::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;