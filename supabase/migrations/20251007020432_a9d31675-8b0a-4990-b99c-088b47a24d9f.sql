-- Create payment gateway configurations table
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- stripe, razorpay, paypal, phonepe, paytm, cashfree, etc.
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb, -- Store API keys, merchant IDs, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider)
);

-- Enable RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Admins can manage payment gateways
CREATE POLICY "Admins can manage payment gateways"
ON public.payment_gateways
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view active payment gateways (for checkout page)
CREATE POLICY "Everyone can view active payment gateways"
ON public.payment_gateways
FOR SELECT
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_gateways_updated_at
BEFORE UPDATE ON public.payment_gateways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default gateways
INSERT INTO public.payment_gateways (name, provider, is_active, is_default, config) VALUES
  ('Stripe', 'stripe', false, false, '{"api_key": "", "webhook_secret": ""}'::jsonb),
  ('Razorpay', 'razorpay', false, false, '{"key_id": "", "key_secret": ""}'::jsonb),
  ('PayPal', 'paypal', false, false, '{"client_id": "", "client_secret": ""}'::jsonb),
  ('PhonePe', 'phonepe', false, false, '{"merchant_id": "", "salt_key": "", "salt_index": ""}'::jsonb),
  ('Paytm', 'paytm', false, false, '{"merchant_id": "", "merchant_key": ""}'::jsonb),
  ('Cashfree', 'cashfree', false, false, '{"app_id": "", "secret_key": ""}'::jsonb)
ON CONFLICT (provider) DO NOTHING;