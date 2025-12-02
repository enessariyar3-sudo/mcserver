import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PlayerStats {
  id: string;
  user_id: string;
  total_playtime_hours: number;
  total_coins_earned: number;
  total_purchases: number;
  total_spent: number;
  first_join_date: string;
  last_activity: string;
  blocks_placed: number;
  blocks_broken: number;
  distance_traveled: number;
  deaths: number;
  kills: number;
  level_data: any;
}

export const usePlayerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('player_statistics')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching player stats:', error);
          setStats(null);
        } else {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching player stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const updateStats = async (updates: Partial<PlayerStats>) => {
    if (!user || !stats) return;

    try {
      const { data, error } = await supabase
        .from('player_statistics')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating player stats:', error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  };

  return {
    stats,
    loading,
    updateStats,
  };
};