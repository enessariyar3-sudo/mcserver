import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Clock, Gamepad2, Map, Coins, Star, Lock } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import Navigation from '@/components/Navigation';

const categoryIcons = {
  milestone: <Star className="h-4 w-4" />,
  playtime: <Clock className="h-4 w-4" />,
  building: <Gamepad2 className="h-4 w-4" />,
  exploration: <Map className="h-4 w-4" />,
  economy: <Coins className="h-4 w-4" />,
};

const AchievementCard = ({ achievement, earned = false, earnedAt }: {
  achievement: any;
  earned?: boolean;
  earnedAt?: string;
}) => (
  <Card className={`transition-all ${earned ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20' : 'opacity-75'}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <CardTitle className="text-lg">{achievement.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={earned ? "default" : "secondary"} className="text-xs">
                {achievement.points} pts
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {achievement.category}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {earned ? (
            <Trophy className="h-6 w-6 text-primary" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="mb-2">
        {achievement.description}
      </CardDescription>
      {earned && earnedAt && (
        <div className="text-sm text-muted-foreground">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Achievements() {
  const { achievements, userAchievements, earnedAchievements, availableAchievements, totalPoints, loading } = useAchievements();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading achievements...</div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(achievements.map(a => a.category))];
  const completionRate = achievements.length > 0 ? (earnedAchievements.length / achievements.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <Award className="inline-block mr-2 h-8 w-8" />
            Achievements
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Track your progress and unlock rewards
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">{earnedAchievements.length}</div>
                <div className="text-sm text-muted-foreground">Earned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(completionRate)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{earnedAchievements.length}/{achievements.length}</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earned">Earned</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="flex items-center gap-1">
                {categoryIcons[category as keyof typeof categoryIcons]}
                <span className="capitalize hidden sm:inline">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => {
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                return (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    earned={!!userAchievement}
                    earnedAt={userAchievement?.earned_at}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="earned">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {earnedAchievements.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No achievements earned yet. Start playing to unlock your first achievement!
                </div>
              ) : (
                earnedAchievements.map((achievement) => {
                  const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                  return (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      earned={true}
                      earnedAt={userAchievement?.earned_at}
                    />
                  );
                })
              )}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements
                  .filter(a => a.category === category)
                  .map((achievement) => {
                    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                    return (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        earned={!!userAchievement}
                        earnedAt={userAchievement?.earned_at}
                      />
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