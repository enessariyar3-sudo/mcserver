import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "BlockBuilder2024",
      rank: "Elite Member",
      avatar: "🧙‍♂️",
      rating: 5,
      text: "IndusNetwork is hands down the best Minecraft server I've ever played on. The community is amazing and the custom features are incredible!"
    },
    {
      name: "CraftMaster",
      rank: "MVP Player",
      avatar: "⚔️",
      rating: 5,
      text: "I've been playing here for over a year and it just keeps getting better. The staff is super helpful and the events are always fun!"
    },
    {
      name: "DiamondHunter",
      rank: "VIP Member",
      avatar: "💎",
      rating: 5,
      text: "The economy system and custom plugins make this server unique. Plus, my rank perks are totally worth it. Highly recommend!"
    },
    {
      name: "RedstoneWiz",
      rank: "Elite Member",
      avatar: "🔧",
      rating: 5,
      text: "Amazing technical features and zero lag. Perfect for building complex redstone contraptions without any issues!"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-futuristic">
            What Players <span className="bg-gradient-primary bg-clip-text text-transparent">Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our amazing community members.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-4 sm:p-6 hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card border-border group relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.rank}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;