import { SEO } from '@/components/SEO';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { ServerStatus } from "@/components/ServerStatus";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import ShopSection from "@/components/ShopSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsSection from "@/components/NewsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <SEO 
        title="IndusNetwork - Premium Minecraft Server | Join Epic Adventures"
        description="Join IndusNetwork's premium Minecraft server with custom features, exclusive ranks, and an amazing community. Start your adventure today!"
        keywords="indusnetwork, minecraft server, premium minecraft, minecraft ranks, minecraft community, survival server, creative server, pvp server"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Hero />
          <ServerStatus />
          <StatsSection />
          <FeaturesSection />
          <ShopSection />
          <TestimonialsSection />
          <NewsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
