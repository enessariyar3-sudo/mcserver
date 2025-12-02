import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  tags: string[];
  author_id: string;
  minecraft_coordinates: string;
  build_time: string;
  materials_used: string[];
  is_featured: boolean;
  is_approved: boolean;
  like_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
}

export const useGallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching gallery:', error);
          return;
        }

        setItems(data || []);
      } catch (error) {
        console.error('Error in fetchGallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const getFeaturedItems = () => items.filter(item => item.is_featured);
  const getItemsByCategory = (category: string) => items.filter(item => item.category === category);

  return {
    items,
    loading,
    getFeaturedItems,
    getItemsByCategory,
  };
};