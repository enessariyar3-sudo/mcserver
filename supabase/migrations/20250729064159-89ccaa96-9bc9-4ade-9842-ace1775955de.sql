-- Add RCON configuration table for storing server details
CREATE TABLE IF NOT EXISTS public.rcon_servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 25575,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rcon_servers table
ALTER TABLE public.rcon_servers ENABLE ROW LEVEL SECURITY;

-- Create policies for rcon_servers (only admins can manage)
CREATE POLICY "Admins can manage RCON servers" 
ON public.rcon_servers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates on rcon_servers
CREATE TRIGGER update_rcon_servers_updated_at
BEFORE UPDATE ON public.rcon_servers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging table for RCON commands
CREATE TABLE IF NOT EXISTS public.rcon_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  server_name TEXT NOT NULL,
  command TEXT NOT NULL,
  result TEXT,
  success BOOLEAN DEFAULT true,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rcon_audit_log table
ALTER TABLE public.rcon_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for rcon_audit_log
CREATE POLICY "Admins can view all RCON logs" 
ON public.rcon_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert RCON logs" 
ON public.rcon_audit_log 
FOR INSERT 
WITH CHECK (true);