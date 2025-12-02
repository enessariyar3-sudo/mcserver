import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";

const NewsSection = () => {
  const newsItems = [
    {
      title: "Season 5 Launch: New Ranks & Features",
      excerpt: "Introducing MVP+ rank with exclusive perks, new spawn area, and custom enchantments!",
      date: "Dec 15, 2024",
      author: "Admin Team",
      image: "🏰",
      category: "Update"
    },
    {
      title: "Winter Sale: 50% Off All Ranks",
      excerpt: "Limited time offer! Get your dream rank at half price. Sale ends December 31st.",
      date: "Dec 10, 2024",
      author: "Store Team",
      image: "❄️",
      category: "Sale"
    },
    {
      title: "Community Event: Build Competition",
      excerpt: "Show off your building skills in our mega build competition. Prizes worth $500!",
      date: "Dec 5, 2024",
      author: "Events Team",
      image: "🏗️",
      category: "Event"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-futuristic">
            Latest <span className="bg-gradient-primary bg-clip-text text-transparent">News</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest announcements, events, and server updates.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <Card key={index} className="p-6 hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card border-border group cursor-pointer">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{item.image}</div>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{item.author}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;