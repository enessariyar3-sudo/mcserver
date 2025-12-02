import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { AdminRoute } from '@/components/AdminRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const SiteSettings = () => {
  const navigate = useNavigate();
  const { settings, isLoading, updateSetting, getSetting } = useSiteSettings();
  
  const [websiteName, setWebsiteName] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');
  const [websiteTagline, setWebsiteTagline] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    if (settings) {
      setWebsiteName(getSetting('website_name'));
      setWebsiteDescription(getSetting('website_description'));
      setWebsiteTagline(getSetting('website_tagline'));
      setServerIp(getSetting('server_ip'));
      setDiscordUrl(getSetting('discord_url'));
      setContactEmail(getSetting('contact_email'));
    }
  }, [settings]);

  const handleSave = () => {
    updateSetting({ key: 'website_name', value: websiteName });
    updateSetting({ key: 'website_description', value: websiteDescription });
    updateSetting({ key: 'website_tagline', value: websiteTagline });
    updateSetting({ key: 'server_ip', value: serverIp });
    updateSetting({ key: 'discord_url', value: discordUrl });
    updateSetting({ key: 'contact_email', value: contactEmail });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Website Settings</CardTitle>
                <CardDescription>
                  Manage your website's basic information and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website_name">Website Name</Label>
                  <Input
                    id="website_name"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g., IndusNetwork"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_tagline">Website Tagline</Label>
                  <Input
                    id="website_tagline"
                    value={websiteTagline}
                    onChange={(e) => setWebsiteTagline(e.target.value)}
                    placeholder="e.g., Join thousands of players in epic adventures"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_description">Website Description</Label>
                  <Textarea
                    id="website_description"
                    value={websiteDescription}
                    onChange={(e) => setWebsiteDescription(e.target.value)}
                    placeholder="Describe your Minecraft server..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server_ip">Server IP Address</Label>
                  <Input
                    id="server_ip"
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    placeholder="e.g., play.indusnetwork.net"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discord_url">Discord URL</Label>
                  <Input
                    id="discord_url"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    placeholder="e.g., https://discord.gg/yourserver"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g., support@indusnetwork.net"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </AdminRoute>
  );
};

export default SiteSettings;
