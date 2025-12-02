import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, Crown, Pickaxe, Sparkles } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Anti-Grief Protection",
      description: "Advanced protection system keeps your builds safe from griefers and ensures fair gameplay.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Custom Plugins",
      description: "Exclusive custom plugins designed specifically for IndusNetwork to enhance your experience.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join thousands of friendly players in our Discord and make lasting friendships.",
      color: "text-diamond"
    },
    {
      icon: Crown,
      title: "Ranks & Perks",
      description: "Unlock special abilities, commands, and exclusive areas with our premium rank system.",
      color: "text-primary"
    },
    {
      icon: Pickaxe,
      title: "Economy System",
      description: "Player-driven economy with jobs, shops, and trading to build your virtual wealth.",
      color: "text-accent"
    },
    {
      icon: Sparkles,
      title: "Regular Events",
      description: "Weekly events, competitions, and seasonal celebrations with amazing prizes.",
      color: "text-diamond"
    }
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-futuristic">
            Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">IndusNetwork</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience Minecraft like never before with our unique features and amazing community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-4 sm:p-6 hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card border-border group">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;