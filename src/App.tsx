import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ServerRules from "./pages/ServerRules";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Leaderboards from "./pages/Leaderboards";
import Achievements from "./pages/Achievements";
import News from "./pages/News";
import Events from "./pages/Events";
import Tutorials from "./pages/Tutorials";
import Gallery from "./pages/Gallery";
import Shop from "./pages/Shop";
import SiteSettings from "./pages/SiteSettings";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "./components/AdminRoute";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/news" element={<News />} />
            <Route path="/events" element={<Events />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/rules" element={<ServerRules />} />
            <Route path="/support" element={<Support />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminRoute>
                <SiteSettings />
              </AdminRoute>
            } />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
