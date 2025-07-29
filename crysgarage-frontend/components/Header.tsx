import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CrysGarageLogo } from "./CrysGarageLogo";
import { 
  User, 
  ChevronDown, 
  LogOut, 
  Settings, 
  CreditCard,
  HelpCircle,
  Wallet,
  Menu,
  X,
  Home,
  BookOpen,
  LifeBuoy,
  Zap,
  Music
} from "lucide-react";

interface UserData {
  name: string;
  email: string;
  tier: string;
  joinDate: string;
  totalTracks: number;
  totalSpent: number;
  isSignedIn: boolean;
}

interface HeaderProps {
  user?: any;
  onSignOut?: () => void;
  onNavigate?: (section: string) => void;
  onShowBilling?: () => void;
  onShowProfile?: () => void;
}

export function Header({ 
  user, 
  onSignOut, 
  onNavigate,
  onShowBilling,
  onShowProfile
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setIsMobileMenuOpen(false);
  };

  const getNavItemClasses = (section: string) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium";
    const activeClasses = "text-crys-gold bg-crys-gold/10 border border-crys-gold/20";
    const inactiveClasses = "text-crys-white hover:text-crys-gold hover:bg-crys-gold/5";
    
    return `${baseClasses} ${inactiveClasses}`;
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    switch (user.tier) {
      case 'free': return 'Free Dashboard';
      case 'professional': return 'Professional Dashboard';
      case 'advanced': return 'Advanced Dashboard';
      default: return 'Dashboard';
    }
  };

  const getCreditsBadgeColor = () => {
    if (!user) return 'bg-crys-gold/20 text-crys-gold';
    switch (user.tier) {
      case 'free': return user.credits > 2 ? 'bg-green-500/20 text-green-400' : 
                         user.credits > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                         'bg-red-500/20 text-red-400';
      case 'professional': return 'bg-blue-500/20 text-blue-400';
      case 'advanced': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, show: true },
    { id: 'dashboard', label: getDashboardLabel(), icon: <Zap className="w-4 h-4" />, show: !!user },
    { id: 'upload', label: 'Upload Audio', icon: <Music className="w-4 h-4" />, show: !!user },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard className="w-4 h-4" />, show: true },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" />, show: true },
    { id: 'help', label: 'Help', icon: <LifeBuoy className="w-4 h-4" />, show: true },
  ];

  return (
    <header className="border-b border-crys-graphite bg-crys-black/95 backdrop-blur supports-[backdrop-filter]:bg-crys-black/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <CrysGarageLogo 
                size={60} 
                onClick={() => handleNavigation('home')}
                className="hover:scale-105 transition-transform duration-200 cursor-pointer"
              />
            </div>
            <div className="hidden sm:block">
              <button 
                onClick={() => handleNavigation('home')}
                className="text-crys-white text-xl font-bold tracking-tight hover:text-crys-gold transition-colors text-left"
              >
                Crys Garage
              </button>
              <p className="text-crys-gold text-xs opacity-90">Professional Audio Mastering</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              item.show && (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={getNavItemClasses(item.id)}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Credits Badge */}
            {user && (
              <Badge 
                variant="secondary" 
                className={`${getCreditsBadgeColor()} border-opacity-30 hidden sm:flex`}
              >
                {user.tier === 'advanced' ? (
                  <>∞ Credits</>
                ) : (
                  <>{user.credits || 0} Credits</>
                )}
              </Badge>
            )}
            
            {/* Tier Badge */}
            {user && (
              <Badge 
                variant="secondary" 
                className="bg-crys-gold/10 text-crys-gold border-crys-gold/30 capitalize hidden sm:flex"
              >
                {user.tier === 'free' ? 'Trial' : user.tier}
              </Badge>
            )}
            
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Menu */}
                <div className="relative group">
                  <button 
                    onClick={() => onShowProfile?.()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crys-gold/10 hover:bg-crys-gold/20 transition-colors"
                  >
                    <div className="w-8 h-8 bg-crys-gold/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-crys-gold" />
                    </div>
                    <span className="text-crys-white text-sm hidden lg:block">
                      {user.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-crys-gold" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-audio-panel-bg border border-crys-graphite rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-crys-graphite">
                      <div className="text-crys-white font-medium text-sm">{user.name || 'User'}</div>
                      <div className="text-crys-light-grey text-xs">{user.email}</div>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => onShowProfile?.()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
                      >
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm">Profile & Wallet</span>
                      </button>
                      <button 
                        onClick={() => onShowBilling?.()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">Billing</span>
                      </button>
                      <button 
                        onClick={() => handleNavigation('help')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm">Help & Support</span>
                      </button>
                      <div className="border-t border-crys-graphite my-2"></div>
                      <button 
                        onClick={onSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleNavigation('signin')}
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 hidden sm:flex"
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleNavigation('signup')}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-crys-white hover:text-crys-gold hover:bg-crys-gold/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-audio-panel-bg border-t border-crys-graphite shadow-lg">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                item.show && (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-crys-white hover:text-crys-gold hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              ))}
              
              {!user && (
                <>
                  <div className="border-t border-crys-graphite my-3"></div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleNavigation('signin')}
                    className="w-full border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleNavigation('signup')}
                    className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}