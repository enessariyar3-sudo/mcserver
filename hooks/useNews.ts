import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_id: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
}

export const useNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news_articles')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Error fetching news:', error);
          return;
        }

        setArticles(data || []);
      } catch (error) {
        console.error('Error in fetchNews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getFeaturedArticles = () => articles.filter(article => article.is_featured);
  const getArticlesByCategory = (category: string) => articles.filter(article => article.category === category);

  return {
    articles,
    loading,
    getFeaturedArticles,
    getArticlesByCategory,
  };
};