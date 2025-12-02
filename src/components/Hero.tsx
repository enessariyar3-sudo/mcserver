import { Button } from "@/components/ui/button";
import { Play, Users, Server } from "lucide-react";
import heroImage from "@/assets/minecraft-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center py-12 sm:py-16">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10 md:space-y-12">
          {/* Main Heading */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground font-gaming leading-tight px-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
                IndusNetwork
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-futuristic leading-relaxed px-4">
              Experience the ultimate Minecraft adventure with custom ranks, exclusive perks, and an amazing community.
            </p>
          </div>

          {/* Server Stats */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 py-4 sm:py-6 animate-slide-up">
            <div className="flex items-center justify-center gap-3 bg-card/60 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-border/50 hover:scale-105 hover:bg-card/80 hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">2,847 Players</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-card/60 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-border/50 hover:scale-105 hover:bg-card/80 hover:shadow-gold transition-all duration-300 cursor-pointer group">
              <Server className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">99.9% Uptime</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-card/60 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-border/50 hover:scale-105 hover:bg-card/80 hover:shadow-diamond transition-all duration-300 cursor-pointer group">
              <Play className="h-5 w-5 sm:h-6 sm:w-6 text-diamond flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-none">play.indusnetwork.com</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5 w-full px-4 sm:px-0 animate-scale-in">
            <Button variant="hero" size="xl" className="group w-full sm:w-auto sm:min-w-[200px] h-14 sm:h-16 text-base sm:text-lg font-bold">
              <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span>Join Server Now</span>
            </Button>
            <Button variant="outline" size="xl" className="bg-background/20 backdrop-blur-md border-2 hover:bg-background/40 w-full sm:w-auto sm:min-w-[180px] h-14 sm:h-16 text-base sm:text-lg font-bold">
              <span>Explore Shop</span>
            </Button>
          </div>

          {/* Server IP */}
          <div className="bg-card/40 backdrop-blur-md border border-border rounded-xl p-5 sm:p-6 max-w-sm sm:max-w-md mx-auto hover:bg-card/60 hover:scale-105 hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-3">Server IP</p>
            <code className="text-base sm:text-xl font-mono font-bold text-primary bg-muted/50 px-3 sm:px-4 py-2 rounded-lg block break-all group-hover:bg-muted/70 group-hover:text-primary-glow transition-all">
              play.indusnetwork.com
            </code>
          </div>
        </div>
      </div>

      {/* Animated Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;