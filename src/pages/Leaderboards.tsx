import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Users, Clock, Gamepad2, Map, Coins } from 'lucide-react';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import Navigation from '@/components/Navigation';

const categoryIcons = {
  playtime: <Clock className="h-4 w-4" />,
  building: <Gamepad2 className="h-4 w-4" />,
  exploration: <Map className="h-4 w-4" />,
  economy: <Coins className="h-4 w-4" />,
  achievements: <Award className="h-4 w-4" />,
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const formatValue = (value: number, statField: string) => {
  switch (statField) {
    case 'total_playtime_hours':
      return `${value}h`;
    case 'total_spent':
      return `$${value}`;
    case 'distance_traveled':
      return `${value.toLocaleString()}m`;
    case 'blocks_placed':
    case 'blocks_broken':
      return value.toLocaleString();
    case 'total_coins_earned':
      return `${value} coins`;
    case 'achievement_count':
      return `${value} achievements`;
    default:
      return value.toString();
  }
};

export default function Leaderboards() {
  const { leaderboards, leaderboardData, loading } = useLeaderboards();
  const [activeCategory, setActiveCategory] = useState('playtime');

  const categories = [...new Set(leaderboards.map(lb => lb.category))];
  const filteredLeaderboards = leaderboards.filter(lb => lb.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading leaderboards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <Users className="inline-block mr-2 h-8 w-8" />
            Leaderboards
          </h1>
          <p className="text-xl text-muted-foreground">
            See how you rank against other players
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                {categoryIcons[category as keyof typeof categoryIcons]}
                <span className="capitalize hidden sm:inline">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLeaderboards.map((leaderboard) => {
                  const entries = leaderboardData[leaderboard.id] || [];
                  
                  return (
                    <Card key={leaderboard.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {categoryIcons[category as keyof typeof categoryIcons]}
                          {leaderboard.name}
                        </CardTitle>
                        <CardDescription>
                          {leaderboard.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {entries.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4">
                              No data yet
                            </div>
                          ) : (
                            entries.slice(0, 10).map((entry) => (
                              <div
                                key={entry.user_id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8">
                                    {getRankIcon(entry.rank)}
                                  </div>
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={entry.profile?.avatar_url} />
                                    <AvatarFallback>
                                      {(entry.profile?.display_name || entry.profile?.minecraft_username || 'U')[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm">
                                      {entry.profile?.display_name || entry.profile?.minecraft_username || 'Unknown Player'}
                                    </div>
                                    {entry.profile?.minecraft_username && entry.profile?.display_name && (
                                      <div className="text-xs text-muted-foreground">
                                        {entry.profile.minecraft_username}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {formatValue(entry.value, leaderboard.stat_field)}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}