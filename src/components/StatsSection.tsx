import { Users, Clock, Trophy, Zap } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "15,000+",
      label: "Active Players",
      description: "Join our growing community"
    },
    {
      icon: Clock,
      value: "99.9%",
      label: "Server Uptime",
      description: "Reliable 24/7 gameplay"
    },
    {
      icon: Trophy,
      value: "500+",
      label: "Achievements",
      description: "Unlock exclusive rewards"
    },
    {
      icon: Zap,
      value: "1M+",
      label: "Rewards Given",
      description: "Coins, items, and more"
    }
  ];

  return (
    <section className="py-20 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Server <span className="bg-gradient-primary bg-clip-text text-transparent">Statistics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See why thousands of players choose IndusNetwork for their Minecraft adventures.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-lg mb-3 sm:mb-4 group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-base sm:text-lg font-semibold text-primary">{stat.label}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground px-2">{stat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;