-- Create news_articles table
CREATE TABLE public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  author_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'general',
  tags text[],
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create server_events table
CREATE TABLE public.server_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'general',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  location text,
  max_participants integer,
  current_participants integer DEFAULT 0,
  rewards text[],
  requirements text[],
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create event_participants table
CREATE TABLE public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.server_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  registered_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'registered',
  UNIQUE(event_id, user_id)
);

-- Create tutorials table
CREATE TABLE public.tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content text NOT NULL,
  difficulty text DEFAULT 'beginner',
  category text NOT NULL,
  tags text[],
  featured_image text,
  video_url text,
  estimated_time integer,
  step_count integer,
  is_published boolean DEFAULT false,
  author_id uuid NOT NULL,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create tutorial_steps table
CREATE TABLE public.tutorial_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id uuid NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  tips text[],
  created_at timestamp with time zone DEFAULT now()
);

-- Create gallery table
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'builds',
  tags text[],
  author_id uuid NOT NULL,
  minecraft_coordinates text,
  build_time text,
  materials_used text[],
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  like_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create content_categories table
CREATE TABLE public.content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content_type text NOT NULL,
  color text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_articles
CREATE POLICY "Everyone can view published articles" ON public.news_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all articles" ON public.news_articles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authors can manage their own articles" ON public.news_articles
  FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for server_events
CREATE POLICY "Everyone can view active events" ON public.server_events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all events" ON public.server_events
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Event creators can manage their events" ON public.server_events
  FOR ALL USING (auth.uid() = created_by);

-- RLS Policies for event_participants
CREATE POLICY "Users can view event participants" ON public.event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own participation" ON public.event_participants
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all participants" ON public.event_participants
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tutorials
CREATE POLICY "Everyone can view published tutorials" ON public.tutorials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all tutorials" ON public.tutorials
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authors can manage their own tutorials" ON public.tutorials
  FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for tutorial_steps
CREATE POLICY "Everyone can view tutorial steps" ON public.tutorial_steps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tutorials 
    WHERE id = tutorial_id AND is_published = true
  ));

CREATE POLICY "Admins can manage all tutorial steps" ON public.tutorial_steps
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutorial authors can manage their steps" ON public.tutorial_steps
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tutorials 
    WHERE id = tutorial_id AND author_id = auth.uid()
  ));

-- RLS Policies for gallery
CREATE POLICY "Everyone can view approved gallery items" ON public.gallery
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage all gallery items" ON public.gallery
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own gallery items" ON public.gallery
  FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for content_categories
CREATE POLICY "Everyone can view active categories" ON public.content_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.content_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_server_events_updated_at
  BEFORE UPDATE ON public.server_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.content_categories (name, slug, description, content_type, color, icon) VALUES
('General News', 'general-news', 'General server news and announcements', 'news', '#3B82F6', '📰'),
('Updates', 'updates', 'Server updates and patch notes', 'news', '#10B981', '🔄'),
('Events', 'events', 'Special server events and competitions', 'news', '#F59E0B', '🎉'),
('Community', 'community', 'Community highlights and features', 'news', '#8B5CF6', '👥'),
('PvP Events', 'pvp-events', 'Player vs Player competitions', 'events', '#EF4444', '⚔️'),
('Building Contests', 'building-contests', 'Creative building competitions', 'events', '#F59E0B', '🏗️'),
('Community Events', 'community-events', 'Social and community gatherings', 'events', '#8B5CF6', '🎊'),
('Beginner Guides', 'beginner-guides', 'Tutorials for new players', 'tutorials', '#10B981', '📚'),
('Advanced Techniques', 'advanced-techniques', 'Advanced gameplay tutorials', 'tutorials', '#F59E0B', '🎯'),
('Building Guides', 'building-guides', 'Construction and design tutorials', 'tutorials', '#3B82F6', '🏘️'),
('Player Builds', 'player-builds', 'Community member creations', 'gallery', '#8B5CF6', '🏠'),
('Server Builds', 'server-builds', 'Official server constructions', 'gallery', '#10B981', '🏛️'),
('Screenshots', 'screenshots', 'Beautiful server moments', 'gallery', '#F59E0B', '📸');

-- Insert sample news articles
INSERT INTO public.news_articles (title, slug, excerpt, content, author_id, category, is_published, published_at) 
SELECT 
  'Welcome to IndusNetwork!',
  'welcome-to-indusnetwork',
  'We''re excited to launch our new Minecraft server with amazing features and a welcoming community.',
  '<h2>Welcome to IndusNetwork</h2><p>We''re thrilled to welcome you to our Minecraft server! Here you''ll find an amazing community, custom features, and endless adventures.</p><h3>What to Expect</h3><ul><li>Custom gameplay mechanics</li><li>Regular events and competitions</li><li>Friendly and helpful community</li><li>Professional staff team</li></ul><p>Join us today and start your adventure!</p>',
  (SELECT user_id FROM profiles LIMIT 1),
  'general-news',
  true,
  now() - interval '2 days'
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- Insert sample events
INSERT INTO public.server_events (title, description, event_type, start_date, end_date, max_participants, rewards, created_by)
SELECT 
  'Weekly Building Contest',
  'Show off your creativity in our weekly building contest! This week''s theme is Medieval Castles.',
  'building-contests',
  now() + interval '2 days',
  now() + interval '9 days',
  50,
  ARRAY['1000 coins', 'Special building tools', 'Winner title'],
  (SELECT user_id FROM profiles LIMIT 1)
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1);