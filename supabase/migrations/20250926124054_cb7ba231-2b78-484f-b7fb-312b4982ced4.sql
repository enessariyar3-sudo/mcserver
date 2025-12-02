-- Create achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  points integer DEFAULT 0,
  category text NOT NULL,
  requirements jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  progress jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- Create player_statistics table
CREATE TABLE public.player_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_playtime_hours integer DEFAULT 0,
  total_coins_earned integer DEFAULT 0,
  total_purchases integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  first_join_date timestamp with time zone DEFAULT now(),
  last_activity timestamp with time zone DEFAULT now(),
  blocks_placed integer DEFAULT 0,
  blocks_broken integer DEFAULT 0,
  distance_traveled integer DEFAULT 0,
  deaths integer DEFAULT 0,
  kills integer DEFAULT 0,
  level_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create leaderboards table for different categories
CREATE TABLE public.leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  stat_field text NOT NULL,
  is_active boolean DEFAULT true,
  refresh_interval text DEFAULT 'daily',
  max_entries integer DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Everyone can view active achievements" ON public.achievements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view user achievements for leaderboards" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "System can insert user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all user achievements" ON public.user_achievements
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for player_statistics
CREATE POLICY "Users can view their own statistics" ON public.player_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view statistics for leaderboards" ON public.player_statistics
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own statistics" ON public.player_statistics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert statistics" ON public.player_statistics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all statistics" ON public.player_statistics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for leaderboards
CREATE POLICY "Everyone can view active leaderboards" ON public.leaderboards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage leaderboards" ON public.leaderboards
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_statistics_updated_at
  BEFORE UPDATE ON public.player_statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at
  BEFORE UPDATE ON public.leaderboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default achievements
INSERT INTO public.achievements (name, description, icon, points, category, requirements) VALUES
('First Steps', 'Join the server for the first time', '👶', 10, 'milestone', '{"type": "first_join"}'),
('Dedicated Player', 'Play for 10 hours total', '⏰', 50, 'playtime', '{"type": "playtime", "hours": 10}'),
('Veteran Player', 'Play for 100 hours total', '🏆', 200, 'playtime', '{"type": "playtime", "hours": 100}'),
('Builder', 'Place 1000 blocks', '🧱', 30, 'building', '{"type": "blocks_placed", "count": 1000}'),
('Architect', 'Place 10000 blocks', '🏗️', 150, 'building', '{"type": "blocks_placed", "count": 10000}'),
('Spender', 'Make your first purchase', '💰', 25, 'economy', '{"type": "first_purchase"}'),
('Big Spender', 'Spend over $50 total', '💎', 100, 'economy', '{"type": "total_spent", "amount": 50}'),
('Explorer', 'Travel 10000 blocks', '🗺️', 40, 'exploration', '{"type": "distance_traveled", "distance": 10000}'),
('Adventurer', 'Travel 100000 blocks', '🚀', 180, 'exploration', '{"type": "distance_traveled", "distance": 100000}');

-- Insert some default leaderboards
INSERT INTO public.leaderboards (name, description, category, stat_field) VALUES
('Top Players by Playtime', 'Players with the most hours played', 'playtime', 'total_playtime_hours'),
('Top Builders', 'Players who have placed the most blocks', 'building', 'blocks_placed'),
('Top Explorers', 'Players who have traveled the furthest', 'exploration', 'distance_traveled'),
('Top Earners', 'Players who have earned the most coins', 'economy', 'total_coins_earned'),
('Top Spenders', 'Players who have spent the most money', 'economy', 'total_spent'),
('Most Achievements', 'Players with the most achievements unlocked', 'achievements', 'achievement_count');