-- Create payment configurations table
CREATE TABLE IF NOT EXISTS public.payment_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'stripe',
  is_active BOOLEAN DEFAULT true,
  test_mode BOOLEAN DEFAULT true,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment plans table for subscription management
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  interval TEXT DEFAULT 'month', -- month, year, one_time
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  features TEXT[],
  rcon_commands TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing orders table to include payment details
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rcon_commands_executed BOOLEAN DEFAULT false;

-- Create payment_transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  user_id UUID NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  customer_email TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscribers table for subscription management
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  plan_id UUID REFERENCES public.payment_plans(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_configs (admin only)
CREATE POLICY "Admins can manage payment configs" 
ON public.payment_configs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create RLS policies for payment_plans (admin manage, public read active)
CREATE POLICY "Everyone can view active payment plans" 
ON public.payment_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage payment plans" 
ON public.payment_plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create RLS policies for payment_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert transactions" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update transactions" 
ON public.payment_transactions 
FOR UPDATE 
USING (true);

-- Create RLS policies for subscribers
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage subscriptions" 
ON public.subscribers 
FOR ALL 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_payment_configs_updated_at
BEFORE UPDATE ON public.payment_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
BEFORE UPDATE ON public.payment_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();