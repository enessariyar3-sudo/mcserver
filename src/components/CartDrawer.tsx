import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CartDrawer = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getItemCount, loading, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase.",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: getTotalPrice(),
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          items.map(item => ({
            order_id: order.id,
            product_name: item.name,
            product_category: item.category,
            product_price: item.price,
            quantity: item.quantity
          }))
        );

      if (itemsError) throw itemsError;

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'one-time',
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category
          })),
          orderId: order.id
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Unable to process checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative group"
        disabled
        aria-label="Shopping cart (loading)"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative group"
          aria-label="Shopping cart"
        >
          <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg bg-card border-primary/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground font-futuristic flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4 flex-1 flex flex-col overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some amazing ranks and items to get started!
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setIsOpen(false)}
              >
                Browse Shop
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 -mr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 sm:p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                      <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 touch-manipulation"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 touch-manipulation"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0 touch-manipulation"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center px-1">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                
                {!user && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 flex-shrink-0" />
                    <span>Sign in required to checkout</span>
                  </div>
                )}
                
                <Button 
                  variant="gaming" 
                  className="w-full touch-manipulation" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !user}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Secure Checkout
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full touch-manipulation"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};