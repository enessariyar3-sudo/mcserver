-- Create custom enum types

-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
