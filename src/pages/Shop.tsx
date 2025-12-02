import { useState } from 'react';
import { SEO } from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const Shop = () => {
  const { products, plans, isLoading } = useProducts();
  const [activeTab, setActiveTab] = useState('all');

  const ranks = products.filter(p => p.category === 'ranks');
  const coins = products.filter(p => p.category === 'coins');
  const kits = products.filter(p => p.category === 'kits');
  const cosmetics = products.filter(p => p.category === 'cosmetics');
  const perks = products.filter(p => p.category === 'perks');

  const allProducts = [...products, ...plans.map(p => ({
    ...p,
    price: Number(p.amount),
    category: 'subscription',
    is_popular: false
  }))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderProducts = (productsList: typeof products) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
      {productsList.length > 0 ? (
        productsList.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.name}
            price={`$${Number(product.price).toFixed(2)}`}
            description={product.description || ''}
            tier={(product.tier || 'basic') as 'basic' | 'premium' | 'elite'}
            features={product.features || []}
            popular={product.is_popular}
            image={product.image_url}
            category={product.category}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground text-lg">No products available in this category yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <SEO 
        title="Shop - Premium Ranks & Items"
        description="Browse our premium Minecraft ranks, coin packages, and exclusive items. Enhance your gameplay with our carefully curated selection."
        keywords="minecraft shop, minecraft ranks, buy minecraft ranks, minecraft coins, premium items"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
      <main className="pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 space-y-4 sm:space-y-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight px-4">
              Our <span className="bg-gradient-primary bg-clip-text text-transparent">Shop</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Enhance your gameplay with premium ranks, coins, and exclusive items
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 sm:mb-10 -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-auto min-w-full lg:grid lg:grid-cols-7 gap-2 p-1 bg-secondary/50 rounded-xl">
                <TabsTrigger value="all" className="min-w-[80px] text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">All</TabsTrigger>
                <TabsTrigger value="ranks" className="min-w-[80px] text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Ranks</TabsTrigger>
                <TabsTrigger value="coins" className="min-w-[80px] text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Coins</TabsTrigger>
                <TabsTrigger value="kits" className="min-w-[80px] text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Kits</TabsTrigger>
                <TabsTrigger value="cosmetics" className="min-w-[100px] text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Cosmetics</TabsTrigger>
                <TabsTrigger value="perks" className="min-w-[80px] text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Perks</TabsTrigger>
                <TabsTrigger value="subscriptions" className="min-w-[120px] text-sm sm:text-base font-medium px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap">Subscriptions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-8">
              {renderProducts(allProducts)}
            </TabsContent>

            <TabsContent value="ranks" className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Premium Ranks</h2>
                <p className="text-muted-foreground">Unlock exclusive features and privileges</p>
              </div>
              {renderProducts(ranks)}
            </TabsContent>

            <TabsContent value="coins" className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Coin Packs</h2>
                <p className="text-muted-foreground">Get coins to purchase in-game items</p>
              </div>
              {renderProducts(coins)}
            </TabsContent>

            <TabsContent value="kits" className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Starter Kits</h2>
                <p className="text-muted-foreground">Get a head start with exclusive kits</p>
              </div>
              {renderProducts(kits)}
            </TabsContent>

            <TabsContent value="cosmetics" className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Cosmetics</h2>
                <p className="text-muted-foreground">Stand out with unique cosmetic items</p>
              </div>
              {renderProducts(cosmetics)}
            </TabsContent>

            <TabsContent value="perks" className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Special Perks</h2>
                <p className="text-muted-foreground">Enhance your gameplay with special abilities</p>
              </div>
              {renderProducts(perks)}
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Subscription Plans</h2>
                <p className="text-muted-foreground">Monthly benefits and rewards</p>
              </div>
              {renderProducts(plans.map(p => ({
                ...p,
                price: Number(p.amount),
                category: 'subscription',
                is_popular: false,
                tier: 'premium',
                is_active: true,
                image_url: undefined,
                created_at: p.created_at,
                updated_at: p.updated_at
              })))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
        <Footer />
      </div>
    </>
  );
};

export default Shop;
