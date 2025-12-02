import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Book, Clock, Eye, Heart, Play, User } from 'lucide-react';
import { useTutorials } from '@/hooks/useTutorials';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500';
    case 'intermediate':
      return 'bg-yellow-500';
    case 'advanced':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const TutorialCard = ({ tutorial }: { tutorial: any }) => (
  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
    {tutorial.featured_image && (
      <div className="aspect-video overflow-hidden rounded-t-lg relative">
        <img 
          src={tutorial.featured_image} 
          alt={tutorial.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {tutorial.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-12 w-12 text-white" />
          </div>
        )}
      </div>
    )}
    <CardHeader className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <Badge 
          className={`text-white ${getDifficultyColor(tutorial.difficulty)}`}
        >
          {tutorial.difficulty}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {tutorial.category.replace('-', ' ')}
        </Badge>
      </div>
      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
        {tutorial.title}
      </CardTitle>
      <CardDescription className="line-clamp-2">
        {tutorial.description}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-4">
          {tutorial.estimated_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {tutorial.estimated_time}m
            </div>
          )}
          <div className="flex items-center gap-1">
            <Book className="h-3 w-3" />
            {tutorial.step_count || 0} steps
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {tutorial.view_count}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {tutorial.like_count}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={tutorial.profiles?.avatar_url} />
            <AvatarFallback className="text-xs">
              S
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Staff
          </span>
        </div>
        <Link 
          to={`/tutorials/${tutorial.slug}`}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Start Tutorial →
        </Link>
      </div>

      {tutorial.tags && tutorial.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tutorial.tags.slice(0, 3).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tutorial.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tutorial.tags.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Tutorials() {
  const { tutorials, loading, getTutorialsByCategory, getTutorialsByDifficulty } = useTutorials();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading tutorials...</div>
        </div>
      </div>
    );
  }

  const beginnerTutorials = getTutorialsByDifficulty('beginner');
  const intermediateTutorials = getTutorialsByDifficulty('intermediate');
  const advancedTutorials = getTutorialsByDifficulty('advanced');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <Book className="inline-block mr-2 h-8 w-8" />
            Tutorials & Guides
          </h1>
          <p className="text-xl text-muted-foreground">
            Learn new skills and techniques with our comprehensive guides
          </p>
        </div>

        {/* Beginner Tutorials */}
        {beginnerTutorials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-green-600">Beginner Guides</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {beginnerTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </section>
        )}

        {/* Intermediate Tutorials */}
        {intermediateTutorials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-yellow-600">Intermediate Guides</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {intermediateTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </section>
        )}

        {/* Advanced Tutorials */}
        {advancedTutorials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-red-600">Advanced Guides</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {advancedTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </section>
        )}

        {tutorials.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tutorials available yet. Check back soon for helpful guides!</p>
          </div>
        )}
      </main>
    </div>
  );
}