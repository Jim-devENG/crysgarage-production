import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { UserDropdown } from './authentication';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onShowAuthModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onShowAuthModal }) => {
  const { user, isAuthenticated } = useFirebaseAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Header render - isAuthenticated:', isAuthenticated, 'user:', user);
  });

  useEffect(() => {
    console.log('Header render - user name:', user?.name, 'user email:', user?.email);
  }, [user]);

  useEffect(() => {
    console.log('Header auth state changed - isAuthenticated:', isAuthenticated, 'user:', user);
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log('Header auth state changed - user name:', user?.name, 'user email:', user?.email);
  }, [user]);

  const debugInfo = `Auth: ${isAuthenticated ? 'Yes' : 'No'} | User: ${user?.name || 'None'}`;

  return (
    <header className="bg-crys-graphite border-b border-crys-light-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('landing')}
              className="text-2xl font-bold text-white hover:text-crys-accent transition-colors"
            >
              Crys Garage
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('landing')}
              className="text-crys-light-grey hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="text-crys-light-grey hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => onNavigate('help')}
              className="text-crys-light-grey hover:text-white transition-colors"
            >
              Help
            </button>
            {/* <button
              onClick={() => onNavigate('courses')}
              className="text-crys-light-grey hover:text-white transition-colors"
            >
              Courses
            </button> */}
          </nav>

          {/* Right Side - Auth or User Menu */}
          <div className="flex items-center space-x-4">
            {/* Debug Info */}
            <div className="text-xs text-crys-light-grey bg-crys-graphite px-2 py-1 rounded">
              {debugInfo}
            </div>

            {/* Test Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Test button clicked - current state:', { isAuthenticated, user });
                console.log('localStorage token:', localStorage.getItem('crysgarage_firebase_token'));
                console.log('localStorage user:', localStorage.getItem('crysgarage_firebase_user'));
                
                // Clear invalid auth state
                if (localStorage.getItem('crysgarage_firebase_token') && !localStorage.getItem('crysgarage_firebase_user')) {
                  console.log('Clearing invalid auth state...');
                  localStorage.removeItem('crysgarage_firebase_token');
                  localStorage.removeItem('crysgarage_firebase_user');
                  window.location.reload();
                }
              }}
              className="text-xs"
            >
              Clear Auth
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>

            {/* Desktop Auth/User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <UserDropdown onNavigate={onNavigate} />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowAuthModal}
                    className="text-crys-light-grey border-crys-light-grey hover:bg-crys-light-grey hover:text-crys-graphite"
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onShowAuthModal}
                    className="bg-crys-accent hover:bg-crys-accent-hover text-white"
                  >
                    Try Free
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-crys-graphite border-t border-crys-light-grey">
              <button
                onClick={() => {
                  onNavigate('landing');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-crys-light-grey hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => {
                  onNavigate('pricing');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-crys-light-grey hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  onNavigate('help');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-crys-light-grey hover:text-white transition-colors"
              >
                Help
              </button>
              {/* <button
                onClick={() => {
                  onNavigate('courses');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-crys-light-grey hover:text-white transition-colors"
              >
                Courses
              </button> */}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-crys-light-grey">
                {isAuthenticated && user ? (
                  <div className="px-3">
                    <UserDropdown onNavigate={onNavigate} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onShowAuthModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-crys-light-grey border-crys-light-grey hover:bg-crys-light-grey hover:text-crys-graphite"
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onShowAuthModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-crys-accent hover:bg-crys-accent-hover text-white"
                    >
                      Try Free
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
