import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CrysGarageLogo } from "./CrysGarageLogo";
import { 
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../contexts/AuthenticationContext";
import { UserDropdown } from "./authentication";

interface HeaderProps {
  onNavigate: (page: string) => void;
  onShowProfile: () => void;
  onDownloadAttempt: () => boolean;
  onShowAuthModal: () => void;
}

export function Header({ 
  onNavigate,
  onShowProfile,
  onDownloadAttempt,
  onShowAuthModal
}: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const navigationItems = [
    { id: 'landing', label: 'Home' },
    { id: 'studio', label: 'Studio' },
    // { id: 'courses', label: 'Courses' },
    { id: 'community', label: 'Community' },
    { id: 'help', label: 'Help' },
  ];

  const handleDownloadClick = () => {
    const canDownload = onDownloadAttempt();
    if (!canDownload) {
      // Download attempt will trigger auth or payment modal
      return;
    }
    // Proceed with download
    console.log('Download proceeding...');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-crys-black/95 backdrop-blur-sm border-b border-crys-graphite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-2 text-crys-white hover:text-crys-gold transition-colors"
            >
              <CrysGarageLogo className="w-8 h-8" />
              <span className="font-bold text-lg">Crys Garage</span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className="text-crys-light-grey hover:text-crys-white transition-colors px-3 py-2"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right Side - Auth/User */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserDropdown onNavigate={onNavigate} />
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={onShowAuthModal}
                  className="text-crys-light-grey hover:text-crys-white transition-colors"
                >
                  Get Started
                </Button>
                <Button
                  onClick={onShowAuthModal}
                  className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-medium"
                >
                  Try Free
                </Button>
              </div>
            )}


            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-crys-light-grey hover:text-crys-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-crys-graphite py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-crys-light-grey hover:text-crys-white transition-colors py-3"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}