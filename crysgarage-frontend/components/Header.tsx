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
  Wallet
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
  onNavigate?: (section: string) => void;
  currentPage?: string;
  credits?: number;
  userTier?: string;
  userData?: UserData;
  onSignOut?: () => void;
}

export function Header({ 
  onNavigate, 
  currentPage, 
  credits = 25, 
  userTier, 
  userData,
  onSignOut 
}: HeaderProps) {
  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  const getNavItemClasses = (section: string) => {
    const baseClasses = "transition-colors";
    const activeClasses = "text-crys-gold";
    const inactiveClasses = "text-crys-white hover:text-crys-gold";
    
    return `${baseClasses} ${currentPage === section ? activeClasses : inactiveClasses}`;
  };

  const getDashboardLabel = () => {
    switch (userTier) {
      case 'free': return 'Free Tier';
      case 'professional': return 'Professional';
      case 'advanced': return 'Advanced';
      default: return 'Dashboard';
    }
  };

  const getCreditsBadgeColor = () => {
    switch (userTier) {
      case 'free': return credits > 2 ? 'bg-green-500/20 text-green-400' : 
                         credits > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                         'bg-red-500/20 text-red-400';
      case 'professional': return 'bg-blue-500/20 text-blue-400';
      case 'advanced': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  const showCredits = currentPage?.includes('dashboard') || currentPage?.startsWith('mastering-');

  return (
    <header className="border-b border-crys-graphite bg-crys-black/95 backdrop-blur supports-[backdrop-filter]:bg-crys-black/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-1 relative">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <CrysGarageLogo 
                size={80} 
                onClick={() => handleNavigation('home')}
                className="hover:scale-105 transition-transform duration-200 absolute left-6 top-2"
              />
            </div>
            <div className="-ml-4">
              <button 
                onClick={() => handleNavigation('home')}
                className="text-crys-white text-xl tracking-tight hover:text-crys-gold transition-colors text-left"
              >
                Crys Garage
              </button>
              <p className="text-crys-gold text-sm opacity-90">Craft the sound, Unleash the future</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('home')}
              className={getNavItemClasses('home')}
            >
              Home
            </button>
            {!userData?.isSignedIn && (
              <button
                onClick={() => handleNavigation('pricing')}
                className={getNavItemClasses('pricing')}
              >
                Pricing
              </button>
            )}
            {userData?.isSignedIn && userTier && (
              <button
                onClick={() => handleNavigation(`${userTier}-dashboard`)}
                className={getNavItemClasses(`${userTier}-dashboard`)}
              >
                {getDashboardLabel()}
              </button>
            )}
            <button
              onClick={() => handleNavigation('courses')}
              className={getNavItemClasses('courses')}
            >
              Courses
            </button>
            <button
              onClick={() => handleNavigation('help')}
              className={getNavItemClasses('help')}
            >
              Help
            </button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {showCredits && userData?.isSignedIn && (
              <Badge 
                variant="secondary" 
                className={`${getCreditsBadgeColor()} border-opacity-30`}
              >
                {userTier === 'advanced' ? (
                  <>∞ Credits</>
                ) : (
                  <>{credits} Credits</>
                )}
              </Badge>
            )}
            
            {userData?.isSignedIn && userTier && (
              <Badge 
                variant="secondary" 
                className="bg-crys-gold/10 text-crys-gold border-crys-gold/30 capitalize"
              >
                {userTier === 'free' ? 'Trial' : userTier}
              </Badge>
            )}
            
            {userData?.isSignedIn ? (
              <div className="flex items-center gap-3">
                {/* User Menu */}
                <div className="relative group">
                  <button 
                    onClick={() => handleNavigation('profile')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crys-gold/10 hover:bg-crys-gold/20 transition-colors"
                  >
                    <div className="w-8 h-8 bg-crys-gold/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-crys-gold" />
                    </div>
                    <span className="text-crys-white text-sm hidden lg:block">
                      {userData.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-crys-gold" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-audio-panel-bg border border-crys-graphite rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-crys-graphite">
                      <div className="text-crys-white font-medium text-sm">{userData.name}</div>
                      <div className="text-crys-light-grey text-xs">{userData.email}</div>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => handleNavigation('profile')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
                      >
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm">Profile & Wallet</span>
                      </button>
                      <button 
                        onClick={() => handleNavigation('pricing')}
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
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
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
          </div>
        </div>
      </div>
    </header>
  );
}