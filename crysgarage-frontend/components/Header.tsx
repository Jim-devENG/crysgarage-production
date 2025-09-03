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
  Music,
  Shield,
  Users
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, show: true },
    { id: 'studio', label: 'Studio', icon: <CreditCard className="w-4 h-4" />, show: true },
    { id: 'about', label: 'About Us', icon: <Users className="w-4 h-4" />, show: true },
    { 
      id: 'help', 
      label: 'Help', 
      icon: <LifeBuoy className="w-4 h-4" />, 
      show: true,
      dropdown: [
        { id: 'help-center', label: 'Help Center', icon: <HelpCircle className="w-4 h-4" /> },
        { id: 'courses', label: 'Tutorials', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-audio-panel-bg/95 backdrop-blur-md border-b border-crys-graphite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <CrysGarageLogo className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative">
                {item.dropdown ? (
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className={getNavItemClasses(item.id)}>
                      {item.icon}
                      <span>{item.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {activeDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-audio-panel-bg border border-crys-graphite rounded-lg shadow-lg py-2 z-50">
                        {item.dropdown.map((dropdownItem) => (
                          <button
                            key={dropdownItem.id}
                            onClick={() => handleNavigation(dropdownItem.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-crys-white hover:bg-crys-gold/10 transition-colors text-left"
                          >
                            {dropdownItem.icon}
                            <span className="text-sm">{dropdownItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={getNavItemClasses(item.id)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
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
                        onClick={() => handleNavigation('billing')}
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
                {/* Authentication buttons */}
                <Button
                  onClick={() => handleNavigation('login')}
                  variant="ghost"
                  className="text-crys-white hover:text-crys-gold hover:bg-crys-gold/10"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleNavigation('signup')}
                  className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-4 py-2 rounded-lg font-semibold"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-crys-white hover:bg-crys-gold/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-audio-panel-bg border-t border-crys-graphite">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
                
                {item.dropdown && (
                  <div className="ml-4 space-y-1">
                    {item.dropdown.map((dropdownItem) => (
                      <button
                        key={dropdownItem.id}
                        onClick={() => handleNavigation(dropdownItem.id)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-crys-light-grey hover:text-crys-white hover:bg-crys-gold/5 rounded-lg transition-colors text-left"
                      >
                        {dropdownItem.icon}
                        <span className="text-sm">{dropdownItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}