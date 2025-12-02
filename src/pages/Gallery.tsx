import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Heart, Eye, MapPin, Clock, Palette } from 'lucide-react';
import { useGallery } from '@/hooks/useGallery';
import Navigation from '@/components/Navigation';

const GalleryItemCard = ({ item }: { item: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img 
              src={item.thumbnail_url || item.image_url} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="capitalize">
                {item.category.replace('-', ' ')}
              </Badge>
              {item.is_featured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
              {item.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {item.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {item.view_count}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {item.like_count}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={item.profiles?.avatar_url} />
            <AvatarFallback className="text-xs">
              S
            </AvatarFallback>
              </Avatar>
            <span className="text-sm text-muted-foreground">
              Staff
            </span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.title}
            {item.is_featured && (
              <Badge variant="default">Featured</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {item.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="aspect-video overflow-hidden rounded-lg">
            <img 
              src={item.image_url} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.profiles?.avatar_url} />
                <AvatarFallback>
                  S
                </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    Staff
                  </div>
                  <div className="text-sm text-muted-foreground">Builder</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>{item.view_count} views</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4" />
                  <span>{item.like_count} likes</span>
                </div>
                {item.minecraft_coordinates && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{item.minecraft_coordinates}</span>
                  </div>
                )}
                {item.build_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Built in {item.build_time}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Category
                </h4>
                <Badge variant="outline" className="capitalize">
                  {item.category.replace('-', ' ')}
                </Badge>
              </div>
              
              {item.materials_used && item.materials_used.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Materials Used</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.materials_used.map((material: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Gallery() {
  const { items, loading, getFeaturedItems, getItemsByCategory } = useGallery();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading gallery...</div>
        </div>
      </div>
    );
  }

  const featuredItems = getFeaturedItems();
  const playerBuilds = getItemsByCategory('player-builds');
  const serverBuilds = getItemsByCategory('server-builds');
  const screenshots = getItemsByCategory('screenshots');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <Image className="inline-block mr-2 h-8 w-8" />
            Gallery
          </h1>
          <p className="text-xl text-muted-foreground">
            Showcase of amazing builds and moments from our community
          </p>
        </div>

        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="player-builds">Player Builds</TabsTrigger>
            <TabsTrigger value="server-builds">Server Builds</TabsTrigger>
            <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="mt-8">
            {featuredItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No featured items yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredItems.map((item) => (
                  <GalleryItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="player-builds" className="mt-8">
            {playerBuilds.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No player builds yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {playerBuilds.map((item) => (
                  <GalleryItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="server-builds" className="mt-8">
            {serverBuilds.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No server builds yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {serverBuilds.map((item) => (
                  <GalleryItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="screenshots" className="mt-8">
            {screenshots.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No screenshots yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {screenshots.map((item) => (
                  <GalleryItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}