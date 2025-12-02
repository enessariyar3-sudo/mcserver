import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Sparkles, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  tier: "basic" | "premium" | "elite";
  popular?: boolean;
  image?: string;
  category: string;
}

const ProductCard = ({ 
  id,
  title, 
  price, 
  originalPrice, 
  description, 
  features, 
  tier, 
  popular = false,
  image,
  category
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart({
        id,
        name: title,
        price: parseFloat(price.replace('$', '')),
        category,
        image
      });
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };
  const tierConfig = {
    basic: {
      icon: Star,
      variant: "default" as const,
      badge: "bg-secondary text-secondary-foreground"
    },
    premium: {
      icon: Crown,
      variant: "gold" as const,
      badge: "bg-gradient-gold text-accent-foreground"
    },
    elite: {
      icon: Sparkles,
      variant: "diamond" as const,
      badge: "bg-gradient-diamond text-diamond-foreground"
    }
  };

  // Fallback to basic if tier is not found
  const config = tierConfig[tier] || tierConfig.basic;
  const Icon = config.icon;

  return (
    <Card className="relative p-6 sm:p-7 md:p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-100 bg-card border-border group h-full flex flex-col touch-manipulation rounded-xl">
      {popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-2 text-xs sm:text-sm font-bold shadow-lg z-10">
          Most Popular
        </Badge>
      )}
      
      <div className="space-y-5 sm:space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ${config.badge} group-hover:scale-110 transition-transform shadow-md`}>
            <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">{title}</h3>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Pricing */}
        <div className="text-center space-y-2 py-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">{price}</span>
            {originalPrice && (
              <span className="text-xl sm:text-2xl text-muted-foreground line-through opacity-60">{originalPrice}</span>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">One-time purchase</p>
        </div>

        {/* Features */}
        <div className="space-y-3 sm:space-y-4 flex-1 py-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 sm:gap-4">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full mt-2 flex-shrink-0 shadow-sm" />
              <span className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          variant={config.variant} 
          size="lg" 
          className="w-full group/btn mt-auto h-14 sm:h-16 text-base sm:text-lg md:text-xl font-bold touch-manipulation active:scale-95 transition-all shadow-md rounded-xl"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <Check className="h-6 w-6 mr-3 flex-shrink-0 animate-scale-in" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-6 w-6 mr-3 group-hover/btn:scale-110 transition-transform flex-shrink-0" />
              <span>Add to Cart</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;