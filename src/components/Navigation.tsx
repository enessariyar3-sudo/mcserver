import { Button } from "@/components/ui/button";
import { User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { AuthModals } from "./AuthModals";
import { CartDrawer } from "./CartDrawer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { getSetting } = useSiteSettings();
  const navigate = useNavigate();
  
  const websiteName = getSetting('website_name') || 'IndusNetwork';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { href: "/", label: "Home", isLink: true },
    { href: "#features", label: "Features" },
    { href: "/shop", label: "Shop", isLink: true },
    { href: "/news", label: "News", isLink: true },
    { href: "/events", label: "Events", isLink: true },
    { href: "/tutorials", label: "Tutorials", isLink: true },
    { href: "/gallery", label: "Gallery", isLink: true },
    { href: "/leaderboards", label: "Leaderboards", isLink: true },
    { href: "/achievements", label: "Achievements", isLink: true },
    { href: "/rules", label: "Rules", isLink: true },
    { href: "/dashboard", label: "Dashboard", isLink: true },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", isLink: true }] : [])
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center animate-pulse-glow flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm font-gaming">IN</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground font-futuristic truncate">{websiteName}</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            item.isLink ? (
              <Link 
                key={item.href}
                to={item.href} 
                className="text-sm font-medium text-foreground hover:text-primary transition-all duration-300 relative group py-1"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ) : (
              <a 
                key={item.href}
                href={item.href} 
                className="text-sm font-medium text-foreground hover:text-primary transition-all duration-300 relative group py-1"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            )
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CartDrawer />
          
          {user ? (
            <div className="hidden sm:flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex group"
                onClick={() => setShowAuth(true)}
              >
                <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Login
              </Button>
              <Button variant="gaming" size="sm" className="hidden sm:flex">
                Join Server
              </Button>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden min-w-[44px] min-h-[44px]"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-md border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                item.isLink ? (
                  <Link 
                    key={item.href}
                    to={item.href} 
                    className="block text-base font-medium text-foreground hover:text-primary hover:bg-secondary/50 transition-all rounded-lg px-4 py-3 min-h-[48px] flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a 
                    key={item.href}
                    href={item.href} 
                    className="block text-base font-medium text-foreground hover:text-primary hover:bg-secondary/50 transition-all rounded-lg px-4 py-3 min-h-[48px] flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              ))}
            </div>
            <div className="pt-6 mt-6 border-t border-border space-y-3">
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setShowAuth(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button variant="gaming" size="sm" className="w-full">
                    Join Server
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <AuthModals 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </nav>
  );
};

export default Navigation;