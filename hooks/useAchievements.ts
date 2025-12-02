import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirements: any;
  is_active: boolean;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  progress: any;
  achievement: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Fetch all active achievements
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('is_active', true)
          .order('category, points');

        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError);
          return;
        }

        setAchievements(achievementsData || []);

        // Fetch user's achievements if logged in
        if (user) {
          const { data: userAchievementsData, error: userAchievementsError } = await supabase
            .from('user_achievements')
            .select(`
              *,
              achievement:achievements(*)
            `)
            .eq('user_id', user.id);

          if (userAchievementsError) {
            console.error('Error fetching user achievements:', userAchievementsError);
          } else {
            setUserAchievements(userAchievementsData || []);
          }
        }
      } catch (error) {
        console.error('Error in fetchAchievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const earnedAchievementIds = new Set(
    userAchievements.map(ua => ua.achievement_id)
  );

  const earnedAchievements = achievements.filter(a => earnedAchievementIds.has(a.id));
  const availableAchievements = achievements.filter(a => !earnedAchievementIds.has(a.id));

  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  return {
    achievements,
    userAchievements,
    earnedAchievements,
    availableAchievements,
    totalPoints,
    loading,
  };
};