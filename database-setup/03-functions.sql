-- Create database functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has a specific role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, minecraft_username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'minecraft_username',
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$$;

-- Function to assign default role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function to check RCON password rate limit
CREATE OR REPLACE FUNCTION public.check_rcon_password_rate_limit(p_user_id UUID, p_server_id UUID)
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
    AND attempted_at > NOW() - INTERVAL '1 minute';
  
  IF recent_attempts >= max_attempts_per_minute THEN
    RETURN FALSE;
  END IF;
  
  -- Check attempts in last hour
  SELECT COUNT(*)
  INTO recent_attempts
  FROM public.rcon_password_access_attempts
  WHERE user_id = p_user_id
    AND attempted_at > NOW() - INTERVAL '1 hour';
  
  IF recent_attempts >= max_attempts_per_hour THEN
    RETURN FALSE;
  END IF;
  
  -- Log this access attempt
  INSERT INTO public.rcon_password_access_attempts (user_id, server_id)
  VALUES (p_user_id, p_server_id);
  
  RETURN TRUE;
END;
$$;

-- Function to log RCON access
CREATE OR REPLACE FUNCTION public.log_rcon_access(
  p_server_id UUID,
  p_access_type TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.rcon_access_log (
    user_id, server_id, access_type, ip_address, user_agent, success, error_message
  ) VALUES (
    auth.uid(), p_server_id, p_access_type, p_ip_address, p_user_agent, p_success, p_error_message
  );
END;
$$;

-- Function to encrypt RCON password
CREATE OR REPLACE FUNCTION public.encrypt_rcon_password(password_text TEXT, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(encrypt(password_text::bytea, encryption_key::bytea, 'aes'), 'base64');
END;
$$;

-- Function to decrypt RCON password
CREATE OR REPLACE FUNCTION public.decrypt_rcon_password(encrypted_password TEXT, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN convert_from(decrypt(decode(encrypted_password, 'base64'), encryption_key::bytea, 'aes'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Function to get RCON servers safely (without passwords)
CREATE OR REPLACE FUNCTION public.get_rcon_servers_safe()
RETURNS TABLE(
  id UUID,
  name TEXT,
  host TEXT,
  port INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  WHERE s.is_active = TRUE;
END;
$$;

-- Function to get RCON password for operations (admin only)
CREATE OR REPLACE FUNCTION public.get_rcon_password_for_operation(
  server_id UUID,
  encryption_key TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_pwd TEXT;
  is_encrypted BOOLEAN;
  rate_limit_ok BOOLEAN;
BEGIN
  -- Check if user has admin permission
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
  WHERE id = server_id AND is_active = TRUE;

  IF encrypted_pwd IS NULL THEN
    RETURN NULL;
  END IF;

  -- If password is encrypted, decrypt it
  IF is_encrypted THEN
    RETURN public.decrypt_rcon_password(encrypted_pwd, encryption_key);
  ELSE
    RETURN encrypted_pwd;
  END IF;
END;
$$;
