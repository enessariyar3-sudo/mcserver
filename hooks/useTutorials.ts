import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  difficulty: string;
  category: string;
  tags: string[];
  featured_image: string;
  video_url: string;
  estimated_time: number;
  step_count: number;
  is_published: boolean;
  author_id: string;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
}

interface TutorialStep {
  id: string;
  tutorial_id: string;
  step_number: number;
  title: string;
  content: string;
  image_url: string;
  tips: string[];
  created_at: string;
}

export const useTutorials = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const { data, error } = await supabase
          .from('tutorials')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tutorials:', error);
          return;
        }

        setTutorials(data || []);
      } catch (error) {
        console.error('Error in fetchTutorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const getTutorialsByCategory = (category: string) => tutorials.filter(tutorial => tutorial.category === category);
  const getTutorialsByDifficulty = (difficulty: string) => tutorials.filter(tutorial => tutorial.difficulty === difficulty);

  return {
    tutorials,
    loading,
    getTutorialsByCategory,
    getTutorialsByDifficulty,
  };
};

export const useTutorialSteps = (tutorialId: string) => {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      if (!tutorialId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tutorial_steps')
          .select('*')
          .eq('tutorial_id', tutorialId)
          .order('step_number', { ascending: true });

        if (error) {
          console.error('Error fetching tutorial steps:', error);
          return;
        }

        setSteps(data || []);
      } catch (error) {
        console.error('Error in fetchSteps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [tutorialId]);

  return {
    steps,
    loading,
  };
};