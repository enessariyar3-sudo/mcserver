import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Users, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CTASection = () => {
  const { toast } = useToast();

  const copyServerIP = () => {
    navigator.clipboard.writeText("play.indusnetwork.com");
    toast({
      title: "Server IP Copied!",
      description: "play.indusnetwork.com has been copied to your clipboard",
    });
  };

  return (
    <section className="py-20 bg-gradient-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(142_76%_36%_/_0.1)_0%,_transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Main CTA */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground font-gaming leading-tight">
              Ready to Start Your
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Adventure?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of players in the ultimate Minecraft experience. Your adventure awaits!
            </p>
          </div>

          {/* Server Connection Card */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Connect to our server</p>
                <div className="flex items-center justify-center space-x-3 bg-muted/50 rounded-lg p-4">
                  <code className="text-xl font-mono text-primary font-bold">
                    play.indusnetwork.com
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyServerIP}
                    className="hover:bg-primary/20"
                    aria-label="Copy server IP address"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold text-foreground">2,847</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Players Online</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Activity className="h-4 w-4 text-accent" />
                    <span className="text-2xl font-bold text-foreground">99.9%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Server Uptime</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="hero" size="xl" className="group">
              <ExternalLink className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Join Server Now
            </Button>
            <Button variant="outline" size="xl" className="bg-background/20 backdrop-blur-sm border-primary/30">
              Browse Shop
            </Button>
          </div>

          {/* Version Support */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Supports Minecraft Versions</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["1.19.x", "1.20.x", "1.21.x"].map((version) => (
                <span 
                  key={version} 
                  className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-mono"
                >
                  {version}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;