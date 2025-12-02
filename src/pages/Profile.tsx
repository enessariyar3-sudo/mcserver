import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { User, Edit, Save, RotateCcw, Camera } from 'lucide-react';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetch } = useProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [skinUrl, setSkinUrl] = useState('');
  
  const [formData, setFormData] = useState({
    display_name: '',
    minecraft_username: '',
    avatar_url: '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        minecraft_username: profile.minecraft_username || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          minecraft_username: formData.minecraft_username,
          avatar_url: formData.avatar_url,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSkinUrl = (username: string) => {
    if (!username) return '';
    return `https://crafatar.com/renders/body/${username}?overlay`;
  };

  const generateAvatarUrl = (username: string) => {
    if (!username) return '';
    return `https://crafatar.com/avatars/${username}?overlay`;
  };

  const handleMinecraftUsernameChange = (value: string) => {
    handleInputChange('minecraft_username', value);
    if (value) {
      setSkinUrl(generateSkinUrl(value));
      if (!formData.avatar_url) {
        handleInputChange('avatar_url', generateAvatarUrl(value));
      }
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="mb-8 sm:mb-10 space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-2 min-h-[44px]"
          >
            ← Back to Dashboard
          </Button>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">Customize your profile and view your Minecraft skin</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="skin">Minecraft Skin</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        handleSave();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="text-sm sm:text-base font-medium">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your display name"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minecraft_username" className="text-sm sm:text-base font-medium">Minecraft Username</Label>
                    <Input
                      id="minecraft_username"
                      value={formData.minecraft_username}
                      onChange={(e) => handleMinecraftUsernameChange(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your Minecraft username"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url" className="text-sm sm:text-base font-medium">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter avatar URL or leave empty to use Minecraft skin"
                      className="h-12 text-base"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          if (profile) {
                            setFormData({
                              display_name: profile.display_name || '',
                              minecraft_username: profile.minecraft_username || '',
                              avatar_url: profile.avatar_url || '',
                            });
                          }
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Preview</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={formData.avatar_url} alt="Profile avatar" />
                    <AvatarFallback>
                      {formData.display_name ? formData.display_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="text-lg font-semibold">
                      {formData.display_name || 'No display name'}
                    </h3>
                    <p className="text-muted-foreground">
                      {formData.minecraft_username || 'No Minecraft username'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Badge variant="secondary">
                      Rank: {profile?.rank || 'Member'}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      <p>Coins: {profile?.coins || 0}</p>
                      <p>Playtime: {profile?.playtime_hours || 0}h</p>
                      <p>Achievements: {profile?.achievements || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Minecraft Skin Viewer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.minecraft_username ? (
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        {formData.minecraft_username}'s Skin
                      </h3>
                      
                      <div className="flex justify-center">
                        <div className="bg-secondary rounded-lg p-6 max-w-sm">
                          {skinUrl ? (
                            <img
                              src={skinUrl}
                              alt={`${formData.minecraft_username}'s Minecraft skin`}
                              className="mx-auto max-h-64 rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="h-64 w-32 bg-muted rounded flex items-center justify-center mx-auto">
                              <span className="text-muted-foreground">No skin available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className="text-center">
                          <h4 className="font-medium mb-2">Head</h4>
                          <Avatar className="h-16 w-16 mx-auto">
                            <AvatarImage 
                              src={generateAvatarUrl(formData.minecraft_username)} 
                              alt="Minecraft head" 
                            />
                            <AvatarFallback>
                              {formData.minecraft_username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="text-center">
                          <h4 className="font-medium mb-2">Skin Details</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Username: {formData.minecraft_username}</p>
                            <p>Skin Type: Steve/Alex</p>
                            <p>Last Updated: Live</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Skin data is fetched live from Minecraft servers. 
                        Changes to your Minecraft skin may take a few minutes to appear.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-32 w-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Minecraft Username</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your Minecraft username in the Profile Settings tab to view your skin.
                    </p>
                    <Button onClick={() => navigate('?tab=profile')}>
                      Add Username
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;