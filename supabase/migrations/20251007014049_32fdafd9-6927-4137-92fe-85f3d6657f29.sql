-- Create site_settings table for managing website configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
CREATE POLICY "Everyone can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('website_name', '{"value": "IndusNetwork"}'),
  ('website_description', '{"value": "The ultimate Minecraft server experience"}'),
  ('website_tagline', '{"value": "Join thousands of players in epic adventures"}'),
  ('server_ip', '{"value": "play.indusnetwork.net"}'),
  ('discord_url', '{"value": "https://discord.gg/indusnetwork"}'),
  ('contact_email', '{"value": "support@indusnetwork.net"}')
ON CONFLICT (setting_key) DO NOTHING;