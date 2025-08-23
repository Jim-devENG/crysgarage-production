import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LandingPage } from './components/LandingPage';
import { FreeTierDashboard } from './components/FreeTier';
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
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';
import { AuthPage } from './components/Auth/AuthPage';
import { BillingPage } from './components/Billing/BillingPage';
import googleAuthService from './services/googleAuth';

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

  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'dashboard' | 'professional' | 'advanced' | 'processing' | 'results' | 'studio' | 'help' | 'courses' | 'marketplace' | 'profile' | 'admin' | 'community' | 'about' | 'login' | 'signup' | 'billing'>('landing');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('free');

  // New authentication modals

  const [pendingTierAccess, setPendingTierAccess] = useState<string | null>(null);

  // URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      console.log('Route change:', path, 'Authenticated:', isAuthenticated);
      
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
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/signup') {
        setCurrentPage('signup');
      } else if (path === '/billing') {
        setCurrentPage('billing');
      } else if (path === '/landing') {
        setCurrentPage('landing');
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
    
    if (section === 'landing') {
      setCurrentPage('landing');
      window.history.pushState({}, '', '/landing');
    } else if (section === 'home') {
      setCurrentPage('landing');
      window.history.pushState({}, '', '/');
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
    } else if (section === 'login') {
      setCurrentPage('login');
      window.history.pushState({}, '', '/login');
    } else if (section === 'signup') {
      setCurrentPage('signup');
      window.history.pushState({}, '', '/signup');
    } else if (section === 'billing') {
      setCurrentPage('billing');
      window.history.pushState({}, '', '/billing');
    }
  };

  // Handle tier selection with new logic
  const handleTierSelection = (tierId: string) => {
    console.log('Tier selection:', tierId);
    setSelectedTier(tierId);
    
    switch (tierId) {
      case 'free':
        // Free tier - direct access, no authentication needed
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/dashboard');
        break;
      case 'professional':
      case 'advanced':
        // Other tiers - require authentication first
        setPendingTierAccess(tierId);
        setCurrentPage('signup');
        break;
      default:
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/dashboard');
    }
  };

  // Handle free tier download (requires authentication)
  const handleFreeTierDownload = () => {
    setCurrentPage('login');
  };

  // Handle authentication success for paid tiers
  const handleAuthSuccess = (userData: any) => {
    console.log('Authentication successful:', userData);
    // For free tier, redirect to dashboard immediately
    if (selectedTier === 'free' || !pendingTierAccess) {
      setCurrentPage('dashboard');
    }
    // For paid tiers, the AuthPage will handle the payment flow
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    console.log('Payment successful');
    if (pendingTierAccess) {
      // Redirect to the appropriate tier dashboard
      if (pendingTierAccess === 'professional') {
        setCurrentPage('professional');
        window.history.pushState({}, '', '/professional');
      } else if (pendingTierAccess === 'advanced') {
        setCurrentPage('advanced');
        window.history.pushState({}, '', '/advanced');
      }
      setPendingTierAccess(null);
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Handle download authentication success
  const handleDownloadAuthSuccess = () => {
    console.log('Download authentication successful');
    // Proceed with download
    console.log('Proceeding with free tier download');
    setCurrentPage('dashboard');
  };

  // Handle Google authentication
  const handleGoogleLogin = async () => {
    try {
      const response = await googleAuthService.signInWithGoogle();
      console.log('Google login successful:', response.user);
      // Handle successful Google login
      // You would typically update your app state here
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const response = await googleAuthService.signInWithGoogle();
      console.log('Google signup successful:', response.user);
      // Handle successful Google signup
      // You would typically update your app state here
    } catch (error) {
      console.error('Google signup failed:', error);
      throw error;
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

  // Main app structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black -z-10" style={{ top: '-80px', height: 'calc(100% + 80px)' }}></div>
      <Header 
        user={user}
        onSignOut={signOut}
        onNavigate={handleNavigation}
        onShowProfile={() => setCurrentPage('profile')}
      />
      
      <main className="pt-20">
        {/* Landing Page */}
        {(currentPage === 'landing' || currentPage === 'home') && (
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

                 {/* Free Tier Dashboard - No authentication required */}
         {currentPage === 'dashboard' && (
           <FreeTierDashboard />
         )}

        {/* Professional Tier Dashboard - Requires authentication */}
        {currentPage === 'professional' && (
          isAuthenticated ? (
            <ProfessionalTierDashboard 
              onFileUpload={(file) => console.log('Professional tier file upload:', file)}
              credits={user?.credits || 0}
            />
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md mx-auto p-6">
                <h2 className="text-white text-xl font-semibold mb-4">
                  Authentication Required
                </h2>
                <p className="text-gray-400 mb-6">
                  Please sign in to access the Professional tier features.
                </p>
                <button
                  onClick={() => {
                    setPendingTierAccess('professional');
                    setCurrentPage('signup');
                  }}
                  className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-2 rounded-lg font-semibold"
                >
                  Get Access
                </button>
              </div>
            </div>
          )
        )}

        {/* Advanced Tier Dashboard - Requires authentication */}
        {currentPage === 'advanced' && (
          isAuthenticated ? (
            <AdvancedTierDashboard 
              onFileUpload={(file) => console.log('Advanced tier file upload:', file)}
            />
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md mx-auto p-6">
                <h2 className="text-white text-xl font-semibold mb-4">
                  Authentication Required
                </h2>
                <p className="text-gray-400 mb-6">
                  Please sign in to access the Advanced tier features.
                </p>
                <button
                  onClick={() => {
                    setPendingTierAccess('advanced');
                    setCurrentPage('signup');
                  }}
                  className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-2 rounded-lg font-semibold"
                >
                  Get Access
                </button>
              </div>
            </div>
          )
        )}

        {/* Other pages */}
        {currentPage === 'studio' && (
          <PricingPage 
            currentTier={user?.tier || "free"}
            onSelectTier={handleTierSelection}
            onGoToDashboard={() => setCurrentPage('studio')}
          />
        )}
        
        {currentPage === 'help' && (
          <HelpPage 
            onGetStarted={() => setCurrentPage('studio')}
          />
        )}
        
        {currentPage === 'courses' && (
          <CoursesPage 
            onGetStarted={() => setCurrentPage('studio')}
          />
        )}
        
        {currentPage === 'marketplace' && (
          <AddonsMarketplace 
            onClose={() => setCurrentPage('studio')}
            onPurchase={() => {}}
            userTier={user?.tier || "free"}
          />
        )}
        
        {currentPage === 'profile' && user && (
          <UserProfile
            onClose={() => setCurrentPage('studio')}
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
        
        {currentPage === 'about' && (
          <AboutUs />
        )}
        
        {/* Authentication Pages */}
        {currentPage === 'login' && (
          <AuthPage
            mode="login"
            selectedTier={pendingTierAccess || "free"}
            onAuthSuccess={handleAuthSuccess}
            onPaymentSuccess={() => setCurrentPage('dashboard')}
            onBack={() => setCurrentPage('landing')}
          />
        )}
        
        {currentPage === 'signup' && (
          <AuthPage
            mode="signup"
            selectedTier={pendingTierAccess || "free"}
            onAuthSuccess={handleAuthSuccess}
            onPaymentSuccess={() => setCurrentPage('dashboard')}
            onBack={() => setCurrentPage('landing')}
          />
        )}
        
        {/* Billing Page */}
        {currentPage === 'billing' && (
          <BillingPage
            userTier={user?.tier || "free"}
            onUpgradePlan={() => setShowPaymentModal(true)}
            onNavigate={handleNavigation}
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
            onStartNewMaster={() => setCurrentPage('studio')}
          />
        )}
      </main>
      
      {/* Footer */}
      <Footer onNavigate={handleNavigation} />
      
      {/* Modals */}
      {/* Billing is now handled as a page, not a modal */}
      
             {showPaymentModal && (
         <PaymentModal 
           onClose={() => setShowPaymentModal(false)}
           isOpen={showPaymentModal}
           selectedTier="professional"
           onPaymentSuccess={() => {
             setShowPaymentModal(false);
             setCurrentPage('studio');
           }}
         />
       )}

             {showProfileEditModal && (
         <ProfileEditModal 
           onClose={() => setShowProfileEditModal(false)}
           userData={{
             name: user?.name || 'User',
             email: user?.email || '',
             tier: user?.tier || 'free',
             joinDate: user?.join_date || '',
             totalTracks: 0,
             totalSpent: 0,
             isSignedIn: !!user
           }}
           onSave={() => {
             setShowProfileEditModal(false);
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