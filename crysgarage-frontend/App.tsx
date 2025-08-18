import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/Auth/AuthModal';
import { FreeTierDashboard } from './components/FreeTierDashboard';
import ProfessionalTierDashboard from './components/ProfessionalTierDashboard';
import AdvancedTierDashboard from './components/AdvancedTierDashboard/index';
import { Header } from './components/Header';
import { ProcessingPage } from './components/ProcessingPage';
import { MasteringResults } from './components/MasteringResults';
import { PricingPage } from './components/PricingPage';
import { HelpPage } from './components/HelpPage';
import { CoursesPage } from './components/CoursesPage';
import { AddonsMarketplace } from './components/AddonsMarketplace';
import { UserProfile } from './components/UserProfile';
import { BillingModal } from './components/BillingModal';
import { PaymentModal } from './components/PaymentModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { AutoAuthFix } from './components/AutoAuthFix';
import { AdminDashboard } from './components/AdminDashboard';
import { CommunityPage } from './components/CommunityPage';
import AboutUs from './components/AboutUs';
import { AutomaticTierAuth } from './components/AutomaticTierAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';

// Main App Component
function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    currentSession, 
    signIn,
    signUp,
    signOut,
    error,
    clearError
  } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'dashboard' | 'professional' | 'advanced' | 'processing' | 'results' | 'studio' | 'help' | 'courses' | 'marketplace' | 'profile' | 'admin' | 'community' | 'about'>('landing');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('free');
  const [showAutomaticTierAuth, setShowAutomaticTierAuth] = useState(false); 

  // Authentication wrapper functions
  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setShowAuthModal(false);
      // Redirect based on user tier
      if (user?.tier === 'pro') {
        setCurrentPage('professional');
        window.history.pushState({}, '', '/professional');
      } else if (user?.tier === 'advanced') {
        setCurrentPage('advanced');
        window.history.pushState({}, '', '/advanced');
      } else {
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await signUp(name, email, password);
      setShowAuthModal(false);
      setCurrentPage('dashboard');
      window.history.pushState({}, '', '/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  // URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      console.log('Route change:', path, 'Authenticated:', isAuthenticated);
      
      // Check authentication for protected routes
      if (!isAuthenticated && path !== '/' && path !== '/studio' && path !== '/help' && path !== '/courses' && path !== '/community' && path !== '/about') {
        console.log('Unauthorized access, redirecting to landing');
        setCurrentPage('landing');
        window.history.pushState({}, '', '/');
        return;
      }
      
      // Set page based on path
      if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (path === '/professional') {
        setCurrentPage('professional');
      } else if (path === '/advanced') {
        setCurrentPage('advanced');
      } else if (path === '/studio') {
        setCurrentPage('studio');
      } else if (path === '/help') {
        setCurrentPage('help');
      } else if (path === '/courses') {
        setCurrentPage('courses');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/community') {
        setCurrentPage('community');
      } else if (path === '/about') {
        setCurrentPage('about');
      } else if (path === '/') {
        setCurrentPage('landing');
      } else {
        setCurrentPage('landing');
      }
    };

    // Handle initial route
    handleRouteChange();

    // Listen for browser navigation
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isAuthenticated]);

  // Handle navigation
  const handleNavigation = (section: string) => {
    console.log('Navigation to:', section);
    
    if (section === 'signin' || section === 'login') {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    if (section === 'signup') {
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }
    
    if (section === 'landing' || section === 'home') {
      setCurrentPage('landing');
      window.history.pushState({}, '', '/');
    } else if (section === 'dashboard') {
      setCurrentPage('dashboard');
      window.history.pushState({}, '', '/dashboard');
    } else if (section === 'studio') {
      setCurrentPage('studio');
      window.history.pushState({}, '', '/studio');
    } else if (section === 'help') {
      setCurrentPage('help');
      window.history.pushState({}, '', '/help');
    } else if (section === 'courses') {
      setCurrentPage('courses');
      window.history.pushState({}, '', '/courses');
    } else if (section === 'community') {
      setCurrentPage('community');
      window.history.pushState({}, '', '/community');
    } else if (section === 'about') {
      setCurrentPage('about');
      window.history.pushState({}, '', '/about');
    }
  };

  // Handle tier selection
  const handleTierSelection = (tierId: string) => {
    console.log('Tier selection:', tierId);
    setSelectedTier(tierId);
    
    switch (tierId) {
      case 'free':
        setShowAutomaticTierAuth(true);
        break;
      case 'professional':
        setCurrentPage('professional');
        window.history.pushState({}, '', '/professional');
        break;
      case 'advanced':
        setCurrentPage('advanced');
        window.history.pushState({}, '', '/advanced');
        break;
      default:
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/dashboard');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading Crys Garage...</h2>
          <p className="text-gray-400 mt-2">Preparing your audio mastering experience</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-white text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={clearError}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Authenticated user
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black -z-10" style={{ top: '-80px', height: 'calc(100% + 80px)' }}></div>
        <Header 
          user={user}
          onSignOut={signOut}
          onNavigate={handleNavigation}
          onShowBilling={() => setShowBillingModal(true)}
          onShowProfile={() => setCurrentPage('profile')}
        />
        
        <main className="pt-20">
          {currentPage === 'dashboard' && (
            <ProtectedRoute requiredTier="free">
              <FreeTierDashboard 
                onFileUpload={(file) => console.log('Free tier file upload:', file)}
                onUpgrade={() => setShowPaymentModal(true)}
                credits={user.credits || 0}
                isAuthenticated={true}
              />
            </ProtectedRoute>
          )}
          
          {currentPage === 'professional' && (
            <ProtectedRoute requiredTier="pro">
              <ProfessionalTierDashboard 
                onFileUpload={(file) => console.log('Professional tier file upload:', file)}
                credits={user.credits || 0}
              />
            </ProtectedRoute>
          )}

          {currentPage === 'advanced' && (
            <ProtectedRoute requiredTier="advanced">
              <AdvancedTierDashboard 
                onFileUpload={(file) => console.log('Advanced tier file upload:', file)}
              />
            </ProtectedRoute>
          )}
          
          {currentPage === 'processing' && currentSession && (
            <ProcessingPage 
              progress={0}
              isProcessing={true}
            />
          )}
          
          {currentPage === 'results' && currentSession && (
            <MasteringResults 
              originalFile={null}
              masteredResult={null}
              audioId={currentSession.id}
              fileName="audio_file.wav"
              selectedTier="professional"
              selectedGenre="afrobeats"
              processingConfig={{
                target_lufs: -14,
                true_peak: -1,
                sample_rate: 44100,
                bit_depth: 24
              }}
              onDownload={() => {}}
              canDownload={true}
              onStartNewMaster={() => setCurrentPage('dashboard')}
            />
          )}
          
          {currentPage === 'studio' && (
            <PricingPage 
              currentTier={user.tier}
              onSelectTier={handleTierSelection}
              onGoToDashboard={() => setCurrentPage('dashboard')}
            />
          )}
          
          {currentPage === 'help' && (
            <HelpPage 
              onGetStarted={() => setCurrentPage('dashboard')}
            />
          )}
          
          {currentPage === 'courses' && (
            <CoursesPage 
              onGetStarted={() => setCurrentPage('dashboard')}
            />
          )}
          
          {currentPage === 'marketplace' && (
            <AddonsMarketplace 
              onClose={() => setCurrentPage('dashboard')}
              onPurchase={() => {}}
              userTier={user.tier}
            />
          )}
          
          {currentPage === 'profile' && (
            <ProtectedRoute requiredTier="free">
              <UserProfile
                onClose={() => setCurrentPage('dashboard')}
                userData={{
                  name: user.name || 'User',
                  email: user.email || '',
                  tier: user.tier,
                  joinDate: user.join_date || '',
                  totalTracks: 0,
                  totalSpent: 0,
                  isSignedIn: true
                }}
                userCredits={user.credits || 0}
                userTier={user.tier}
              />
            </ProtectedRoute>
          )}
          
          {currentPage === 'admin' && (
            <AdminDashboard onBack={() => setCurrentPage('landing')} />
          )}
          
          {currentPage === 'community' && (
            <CommunityPage currentUser={user} />
          )}
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigation} />

        {/* Modals */}
        {showBillingModal && (
          <BillingModal 
            onClose={() => setShowBillingModal(false)}
            userTier={user.tier}
            onUpgradePlan={() => setShowPaymentModal(true)}
          />
        )}
        
        {showPaymentModal && (
          <PaymentModal 
            onClose={() => setShowPaymentModal(false)}
            isOpen={showPaymentModal}
            selectedTier="professional"
            onPaymentSuccess={() => {
              setShowPaymentModal(false);
              setCurrentPage('dashboard');
            }}
          />
        )}

        {showProfileEditModal && (
          <ProfileEditModal 
            onClose={() => setShowProfileEditModal(false)}
            userData={{
              name: user.name || 'User',
              email: user.email || '',
              tier: user.tier,
              joinDate: user.join_date || '',
              totalTracks: 0,
              totalSpent: 0,
              isSignedIn: true
            }}
            onSave={() => {
              setShowProfileEditModal(false);
              setCurrentPage('dashboard');
            }}
          />
        )}
      </div>
    );
  }

  // Not authenticated - show landing page
  console.log('Showing landing page. Current page:', currentPage, 'Path:', window.location.pathname);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black -z-10" style={{ top: '-80px', height: 'calc(100% + 80px)' }}></div>
      <Header 
        user={user}
        onNavigate={handleNavigation}
        onShowBilling={() => setShowBillingModal(true)}
        onShowProfile={() => setShowProfileEditModal(true)}
        onSignOut={signOut}
      />
      
      <main className={currentPage === 'about' ? 'pt-12' : 'pt-20'}>
        {/* Always show landing page for non-authenticated users */}
        {(currentPage === 'landing' || currentPage === 'home' || window.location.pathname === '/') && (
          <LandingPage 
            onGetStarted={() => {
              console.log('Landing: onGetStarted clicked');
              setCurrentPage('studio');
              window.history.pushState({}, '', '/studio');
            }}
            onTryMastering={() => {
              console.log('Landing: onTryMastering clicked');
              setCurrentPage('dashboard');
              window.history.pushState({}, '', '/dashboard');
            }}
          />
        )}
        
        {currentPage === 'studio' && (
          <PricingPage 
            currentTier="free"
            onSelectTier={handleTierSelection}
            onGoToDashboard={() => setCurrentPage('dashboard')}
          />
        )}
        
        {currentPage === 'help' && (
          <HelpPage 
            onGetStarted={() => setCurrentPage('dashboard')}
          />
        )}
        
        {currentPage === 'courses' && (
          <CoursesPage 
            onGetStarted={() => setCurrentPage('dashboard')}
          />
        )}
        
        {currentPage === 'dashboard' && (
          <ProtectedRoute requiredTier="free">
            <FreeTierDashboard 
              onFileUpload={(file) => console.log('Free tier file upload:', file)}
              onUpgrade={() => setShowPaymentModal(true)}
              credits={user?.credits || 3}
              isAuthenticated={isAuthenticated}
            />
          </ProtectedRoute>
        )}

        {currentPage === 'professional' && (
          <ProfessionalTierDashboard 
            onFileUpload={(file) => console.log('Professional tier file upload:', file)}
            credits={0}
          />
        )}

        {currentPage === 'advanced' && (
          <AdvancedTierDashboard 
            onFileUpload={(file) => console.log('Advanced tier file upload:', file)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard onBack={() => setCurrentPage('landing')} />
        )}
        
        {currentPage === 'community' && (
          <CommunityPage currentUser={null} />
        )}
        
        {currentPage === 'about' && (
          <AboutUs />
        )}
      </main>
      
      {/* Footer */}
      <Footer onNavigate={handleNavigation} />
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          initialMode={authMode}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onClose={() => setShowAuthModal(false)}
          isLoading={isLoading}
          error={error}
        />
      )}
      
      {showAutomaticTierAuth && (
        <AutomaticTierAuth
          onClose={() => setShowAutomaticTierAuth(false)}
          onUpgrade={() => {
            setShowAutomaticTierAuth(false);
            setCurrentPage('studio');
          }}
        />
      )}
    </div>
  );
}

// Root App Component with Provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;