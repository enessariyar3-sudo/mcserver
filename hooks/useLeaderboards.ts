import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  value: number;
  rank: number;
  profile?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
}

interface Leaderboard {
  id: string;
  name: string;
  description: string;
  category: string;
  stat_field: string;
  is_active: boolean;
}

export const useLeaderboards = () => {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        // Fetch all active leaderboards
        const { data: leaderboardsData, error: leaderboardsError } = await supabase
          .from('leaderboards')
          .select('*')
          .eq('is_active', true)
          .order('category, name');

        if (leaderboardsError) {
          console.error('Error fetching leaderboards:', leaderboardsError);
          return;
        }

        setLeaderboards(leaderboardsData || []);

        // Fetch data for each leaderboard
        const leaderboardDataMap: Record<string, LeaderboardEntry[]> = {};

        for (const leaderboard of leaderboardsData || []) {
          let query = supabase
            .from('player_statistics')
            .select(`
              user_id,
              ${leaderboard.stat_field},
              profiles!inner(display_name, minecraft_username, avatar_url)
            `);

          // Special handling for achievements leaderboard
          if (leaderboard.stat_field === 'achievement_count') {
            const { data: achievementCounts, error } = await supabase
              .from('user_achievements')
              .select(`
                user_id,
                profiles!inner(display_name, minecraft_username, avatar_url)
              `);

            if (!error && achievementCounts) {
              const counts = achievementCounts.reduce((acc: Record<string, any>, item) => {
                if (!acc[item.user_id]) {
                  acc[item.user_id] = {
                    user_id: item.user_id,
                    count: 0,
                    profile: item.profiles
                  };
                }
                acc[item.user_id].count++;
                return acc;
              }, {});

              const entries: LeaderboardEntry[] = Object.values(counts)
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, leaderboard.max_entries || 100)
                .map((item: any, index) => ({
                  user_id: item.user_id,
                  value: item.count,
                  rank: index + 1,
                  profile: item.profile
                }));

              leaderboardDataMap[leaderboard.id] = entries;
            }
          } else {
            const { data, error } = await query
              .order(leaderboard.stat_field, { ascending: false })
              .limit(leaderboard.max_entries || 100);

            if (!error && data) {
              const entries: LeaderboardEntry[] = data
                .filter((item: any) => item[leaderboard.stat_field] > 0)
                .map((item: any, index) => ({
                  user_id: item.user_id,
                  value: item[leaderboard.stat_field],
                  rank: index + 1,
                  profile: item.profiles
                }));

              leaderboardDataMap[leaderboard.id] = entries;
            }
          }
        }

        setLeaderboardData(leaderboardDataMap);
      } catch (error) {
        console.error('Error in fetchLeaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  return {
    leaderboards,
    leaderboardData,
    loading,
  };
};