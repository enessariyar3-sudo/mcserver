import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, User, Clock, Trophy, Coins } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { z } from 'zod';
import { toast } from 'sonner';

const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .min(3, "Display name must be at least 3 characters")
    .max(30, "Display name must be less than 30 characters")
    .regex(/^[a-zA-Z0-9\s_-]+$/, "Display name can only contain letters, numbers, spaces, underscores, and hyphens"),
  minecraft_username: z.string()
    .trim()
    .min(3, "Minecraft username must be at least 3 characters")
    .max(16, "Minecraft username must be less than 16 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Minecraft username can only contain letters, numbers, and underscores")
});

export const ProfileCard = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    minecraft_username: '',
    display_name: '',
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 bg-muted rounded-full mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No profile found</p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = () => {
    setEditData({
      minecraft_username: profile.minecraft_username || '',
      display_name: profile.display_name || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const validationResult = profileSchema.safeParse(editData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(`Validation Error: ${firstError.message}`);
      return;
    }
    
    await updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      minecraft_username: '',
      display_name: '',
    });
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-lg">
              {profile.display_name?.[0]?.toUpperCase() || profile.minecraft_username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={editData.display_name}
                onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                placeholder="Your display name"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                3-30 characters, letters, numbers, spaces, underscores, and hyphens only
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minecraft_username">Minecraft Username</Label>
              <Input
                id="minecraft_username"
                value={editData.minecraft_username}
                onChange={(e) => setEditData({ ...editData, minecraft_username: e.target.value })}
                placeholder="Your Minecraft username"
                maxLength={16}
              />
              <p className="text-xs text-muted-foreground">
                3-16 characters, letters, numbers, and underscores only
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <CardTitle className="text-xl">
              {profile.display_name || profile.minecraft_username || 'Unknown Player'}
            </CardTitle>
            <CardDescription>
              {profile.minecraft_username && profile.display_name !== profile.minecraft_username && (
                <span className="text-sm">@{profile.minecraft_username}</span>
              )}
            </CardDescription>
            <Badge variant="secondary" className="w-fit mx-auto">
              {profile.rank}
            </Badge>
            <Button onClick={handleEdit} variant="outline" size="sm" className="mt-4">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </>
        )}
      </CardHeader>

      {!isEditing && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Coins className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{profile.coins.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Coins</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">{profile.achievements}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{profile.playtime_hours}h</div>
            <div className="text-sm text-muted-foreground">Playtime</div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};