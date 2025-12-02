import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye, User, ArrowRight, Newspaper } from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';

const NewsCard = ({ article }: { article: any }) => (
  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    {article.featured_image && (
      <div className="aspect-video overflow-hidden rounded-t-lg">
        <img 
          src={article.featured_image} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    <CardHeader>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="capitalize">
          {article.category.replace('-', ' ')}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-3 w-3" />
          {article.view_count}
        </div>
      </div>
      <CardTitle className="group-hover:text-primary transition-colors">
        {article.title}
      </CardTitle>
      <CardDescription className="line-clamp-2">
        {article.excerpt}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={article.profiles?.avatar_url} />
            <AvatarFallback className="text-xs">
              S
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Staff
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(article.published_at).toLocaleDateString()}
        </div>
      </div>
      <Link 
        to={`/news/${article.slug}`}
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mt-3"
      >
        Read more <ArrowRight className="h-3 w-3" />
      </Link>
    </CardContent>
  </Card>
);

export default function News() {
  const { articles, loading, getFeaturedArticles } = useNews();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading news...</div>
        </div>
      </div>
    );
  }

  const featuredArticles = getFeaturedArticles();
  const regularArticles = articles.filter(article => !article.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <Newspaper className="inline-block mr-2 h-8 w-8" />
            Server News
          </h1>
          <p className="text-xl text-muted-foreground">
            Stay updated with the latest server news and announcements
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Latest News</h2>
          {regularArticles.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No news articles yet. Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}