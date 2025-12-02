-- Initial/seed data for the database

-- Insert default payment gateways
INSERT INTO public.payment_gateways (name, provider, is_active, is_default, config) VALUES
  ('Stripe', 'stripe', false, false, '{"api_key": "", "webhook_secret": ""}'::jsonb),
  ('Razorpay', 'razorpay', false, false, '{"key_id": "", "key_secret": ""}'::jsonb),
  ('PayPal', 'paypal', false, false, '{"client_id": "", "client_secret": ""}'::jsonb),
  ('PhonePe', 'phonepe', false, false, '{"merchant_id": "", "salt_key": "", "salt_index": ""}'::jsonb),
  ('Paytm', 'paytm', false, false, '{"merchant_id": "", "merchant_key": ""}'::jsonb),
  ('Cashfree', 'cashfree', false, false, '{"app_id": "", "secret_key": ""}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('server_name', '{"value": "IndusNetwork"}'::jsonb),
  ('server_ip', '{"value": "play.indusnetwork.com"}'::jsonb),
  ('discord_url', '{"value": ""}'::jsonb),
  ('twitter_url', '{"value": ""}'::jsonb),
  ('youtube_url', '{"value": ""}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample products (optional - comment out if not needed)
-- INSERT INTO public.products (name, description, price, category, tier, features, is_active, is_popular) VALUES
--   ('VIP Rank', 'Get exclusive VIP perks and features', 9.99, 'ranks', 'premium', ARRAY['Colored chat', '/fly command', '5 homes'], true, true),
--   ('100 Coins', 'In-game currency pack', 4.99, 'currency', 'basic', ARRAY['100 coins', 'Instant delivery'], true, false),
--   ('Starter Kit', 'Essential items to start your journey', 2.99, 'kits', 'basic', ARRAY['Diamond tools', 'Food', 'Armor'], true, false);

-- Insert sample achievements (optional - comment out if not needed)
-- INSERT INTO public.achievements (name, description, category, icon, points, is_active) VALUES
--   ('First Steps', 'Join the server for the first time', 'general', '🎯', 10, true),
--   ('Builder', 'Place 1000 blocks', 'building', '🏗️', 50, true),
--   ('Explorer', 'Travel 10000 blocks', 'exploration', '🗺️', 75, true);
