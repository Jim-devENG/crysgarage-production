import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthPages';
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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'dashboard' | 'professional' | 'advanced' | 'processing' | 'results' | 'studio' | 'help' | 'courses' | 'marketplace' | 'profile' | 'admin' | 'community' | 'about'>('landing');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('free'); // Add selected tier state 

  // Authentication wrapper functions
  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setCurrentPage('dashboard'); // Redirect to dashboard
    } catch (error) {
      // Error is handled by the context
      console.error('Sign in error:', error);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      await signUp(name, email, password);
      setCurrentPage('dashboard'); // Redirect to dashboard
    } catch (error) {
      // Error is handled by the context
      console.error('Sign up error:', error);
    }
  };

  // URL-based routing with browser history support
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      console.log('Current path:', path);
      
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
        // Default to landing page for unknown routes
        setCurrentPage('landing');
      }
    };

    // Handle initial route
    handleRouteChange();

    // Listen for browser navigation (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange);

    // Prevent accidental page closure during processing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentPage === 'professional' || currentPage === 'advanced') {
        const message = 'Are you sure you want to leave? Your audio processing progress may be lost.';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentPage]);

  // Handle navigation with proper type conversion and browser history
  const handleNavigation = (section: string) => {
    console.log('Navigation requested to:', section);
    
    // Handle authentication actions
    if (section === 'signin') {
      console.log('Opening signin modal');
      setAuthMode('signin');
      setShowAuthModal(true);
      return;
    }
    
    if (section === 'signup') {
      console.log('Opening signup modal');
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }
    
    // Handle page navigation with browser history
    if (section === 'landing' || section === 'home') {
      console.log('Setting current page to: landing');
      setCurrentPage('landing');
      window.history.pushState({}, '', '/');
    } else if (section === 'dashboard') {
      console.log('Setting current page to: dashboard');
      setCurrentPage('dashboard');
      window.history.pushState({}, '', '/dashboard');
    } else if (section === 'processing') {
      console.log('Setting current page to: processing');
      setCurrentPage('processing');
      window.history.pushState({}, '', '/processing');
    } else if (section === 'results') {
      console.log('Setting current page to: results');
      setCurrentPage('results');
      window.history.pushState({}, '', '/results');
    } else if (section === 'studio') {
      console.log('Setting current page to: studio');
      setCurrentPage('studio');
      window.history.pushState({}, '', '/studio');
    } else if (section === 'help') {
      console.log('Setting current page to: help');
      setCurrentPage('help');
      window.history.pushState({}, '', '/help');
    } else if (section === 'courses') {
      console.log('Setting current page to: courses');
      setCurrentPage('courses');
      window.history.pushState({}, '', '/courses');
    } else if (section === 'marketplace') {
      console.log('Setting current page to: marketplace');
      setCurrentPage('marketplace');
      window.history.pushState({}, '', '/marketplace');
    } else if (section === 'profile') {
      console.log('Setting current page to: profile');
      setCurrentPage('profile');
      window.history.pushState({}, '', '/profile');
    } else if (section === 'admin') {
      console.log('Setting current page to: admin');
      setCurrentPage('admin');
      window.history.pushState({}, '', '/admin');
    } else if (section === 'community') {
      console.log('Setting current page to: community');
      setCurrentPage('community');
      window.history.pushState({}, '', '/community');
    } else if (section === 'about') {
      console.log('Setting current page to: about');
      setCurrentPage('about');
      window.history.pushState({}, '', '/about');
    }
    // Note: 'professional' and 'advanced' are intentionally excluded to prevent direct navigation
  };

  // Handle tier selection with browser history
  const handleTierSelection = (tierId: string) => {
    console.log('Tier selection triggered:', tierId);
    setSelectedTier(tierId);
    
    // Route to appropriate dashboard based on tier
    switch (tierId) {
      case 'free':
        console.log('Routing to free dashboard');
        setCurrentPage('dashboard'); // Free tier dashboard
        window.history.pushState({}, '', '/dashboard');
        break;
      case 'professional':
        console.log('Routing to professional dashboard');
        setCurrentPage('professional'); // Professional tier dashboard
        window.history.pushState({}, '', '/professional');
        break;
      case 'advanced':
        console.log('Routing to advanced dashboard');
        setCurrentPage('advanced'); // Advanced tier dashboard
        window.history.pushState({}, '', '/advanced');
        break;
      default:
        console.log('Routing to default dashboard');
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/dashboard');
    }
  };

  // Loading state
  if (isLoading) {
    console.log('App is loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading Crys Garage...</h2>
          <p className="text-gray-400 mt-2">Preparing your audio mastering experience</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded"
          >
            Force Reload
          </button>
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

  // Authenticated user - show dashboard
  console.log('App state:', { isAuthenticated, isLoading, currentPage, user: !!user });
  if (isAuthenticated && user) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
        {/* Background overlay to cover gaps */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black -z-10" style={{ top: '-80px', height: 'calc(100% + 80px)' }}></div>
        <Header 
          user={user}
          onSignOut={signOut}
          onNavigate={handleNavigation}
          onShowBilling={() => setShowBillingModal(true)}
          onShowProfile={() => setCurrentPage('profile')}
        />
        
        <main className="pt-20">
          {(() => { console.log('Current page is:', currentPage); return null; })()}
          {currentPage === 'home' && (
            <LandingPage 
              onGetStarted={() => {
                setCurrentPage('dashboard');
              }}
              onTryMastering={() => {
                setCurrentPage('dashboard');
              }}
            />
          )}
          
          {currentPage === 'dashboard' && (
            <FreeTierDashboard 
              onFileUpload={(file) => {
                // Handle file upload for free tier
                console.log('Free tier file upload:', file);
                // You can add upload logic here or call a function from context
              }}
              onUpgrade={() => setShowPaymentModal(true)}
              credits={user.credits || 0}
              isAuthenticated={true} // Pass authentication status
            />
          )}
          
          {currentPage === 'professional' && (
            <ProfessionalTierDashboard 
              onFileUpload={(file) => {
                // Handle file upload for professional tier
                console.log('Professional tier file upload:', file);
                // You can add upload logic here or call a function from context
              }}
              credits={user.credits || 0}
            />
          )}

          {currentPage === 'advanced' && (
            <AdvancedTierDashboard 
              onFileUpload={(file) => {
                // Handle file upload for advanced tier
                console.log('Advanced tier file upload:', file);
                // You can add upload logic here or call a function from context
              }}
            />
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
          )}
          
          {currentPage === 'admin' && (
            <AdminDashboard onBack={() => setCurrentPage('landing')} />
          )}
          
          {currentPage === 'community' && (
            <CommunityPage currentUser={user} />
          )}
        </main>

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
        
        {/* Auth Modal for authenticated users */}
              {/* Authentication modal removed for now */}
                </div>
    );
  }

  // Not authenticated - show landing page
  console.log('Showing landing page for non-authenticated user');
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
        {/* Background overlay to cover gaps */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black -z-10" style={{ top: '-80px', height: 'calc(100% + 80px)' }}></div>
      <Header 
        user={null}
        onNavigate={handleNavigation}
        onShowBilling={() => setShowAuthModal(true)}
        onShowProfile={() => setShowAuthModal(true)}
      />
      
      <main className={currentPage === 'about' ? 'pt-12' : 'pt-20'}>
        {currentPage === 'landing' && (
          <LandingPage 
            onGetStarted={() => {
              setCurrentPage('dashboard');
            }}
            onTryMastering={() => {
              setCurrentPage('dashboard');
            }}
          />
        )}
      
      {currentPage === 'home' && (
        <LandingPage 
          onGetStarted={() => {
            setCurrentPage('dashboard');
          }}
          onTryMastering={() => {
            setCurrentPage('dashboard');
          }}
        />
      )}
      
             {currentPage === 'studio' && (
         <PricingPage 
           currentTier="free"
           onSelectTier={handleTierSelection}
           onGoToDashboard={() => {
             setCurrentPage('dashboard');
           }}
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
        
        {currentPage === 'dashboard' && !isAuthenticated && (
          <FreeTierDashboard 
            onFileUpload={(file) => {
              console.log('Free tier file upload:', file);
            }}
            onUpgrade={() => setShowPaymentModal(true)}
            credits={3}
            isAuthenticated={false}
          />
        )}

        {currentPage === 'professional' && !isAuthenticated && (
          <ProfessionalTierDashboard 
            onFileUpload={(file) => {
              console.log('Professional tier file upload:', file);
            }}
            credits={0}
          />
        )}

        {currentPage === 'advanced' && !isAuthenticated && (
          <AdvancedTierDashboard 
            onFileUpload={(file) => {
              console.log('Advanced tier file upload:', file);
            }}
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
      
      {showAuthModal && (
        <AuthModal 
          initialMode={authMode}
          onSignIn={signIn}
          onSignUp={signUp}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      
      {/* Auto auth fix for development */}
      <AutoAuthFix />
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