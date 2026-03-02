import React, { useState, useEffect } from 'react';
import { AuthenticationProvider, useAuth } from './contexts/AuthenticationContext';
import { AppProvider } from './contexts/AppContext';
import { LandingPage } from './components/LandingPage';
import { FreeTierDashboard } from './components/FreeTier';
// import FreeTierDashboardPython from './components/FreeTier/FreeTierDashboardPython';
import ProfessionalTierDashboard from './components/ProfessionalTier/ProfessionalTierDashboard';
import AdvancedTierDashboard from './components/AdvancedTierDashboard/index';
import { Header } from './components/Header';
import { ProcessingPage } from './components/ProcessingPage';
import { MasteringResults } from './components/MasteringResults';
import { PricingPage } from './components/PricingPage';
import { HelpPage } from './components/HelpPage';
// import { CoursesPage } from './components/CoursesPage';
import { AddonsMarketplace } from './components/AddonsMarketplace';
import { UserProfile } from './components/UserProfile';
import { BillingModal } from './components/BillingModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MainForumSection } from './components/forum/MainForumSection';
import AboutUs from './components/AboutUs';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';
import MLPipelineTestPage from './components/MLPipelineTestPage';
import { BillingPage } from './components/Billing/BillingPage';
import { ProfilePage } from './components/ProfilePage';
import { PaymentSuccessPage } from './components/Payment/PaymentSuccessPage';
import { AuthModal, UserDropdown, PaymentModal } from './components/authentication';
import { DEV_MODE, logDevAction } from './utils/secureDevMode';
import { DevModeToggle } from './components/DevModeToggle';
import { DevModeBadge } from './components/DevModeBadge';
import { DevDeploymentIndicator } from './components/DevDeploymentIndicator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CookiePolicy from './components/CookiePolicy';
import Support from './components/Support';
import Careers from './components/Careers';
import DevAccess from './components/DevAccess';
// Removed old Matchering components - using new FreeTierDashboard
import { NormalizerPage } from './components/NormalizerPage';
import { AnalyzerPage } from './components/AnalyzerPage';
// import { MaintenanceBanner } from './components/MaintenanceBanner';

function AppContent() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [pendingTierAccess, setPendingTierAccess] = useState<string | null>(null);

  // Handle URL routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1);
      // Remove trailing slash if present
      const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
      // If path is empty (root URL), set to 'landing'
      const page = cleanPath === '' ? 'landing' : cleanPath;
      console.log('URL routing - path:', path, 'cleanPath:', cleanPath, 'page:', page);
      setCurrentPage(page);
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Initial load

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  useEffect(() => {
    console.log('Modal states - showAuthModal:', showAuthModal, 'showPaymentModal:', showPaymentModal);
  }, [showAuthModal, showPaymentModal]);

  // CRITICAL: Payment modal is controlled ONLY by user actions, NOT by credit state
  // Credits determine eligibility, user actions determine when modal opens
  // NO auto-opening based on credits - this was causing UX issues

  // CRITICAL: Refresh credits from backend ONCE when navigating to dashboard
  // This ensures access checks use authoritative credit balance
  // FIXED: Removed refreshUser from dependencies to prevent infinite loops
  // FIXED: Added guard to prevent multiple refreshes per dashboard visit
  const hasRefreshedOnDashboardRef = React.useRef<string>('');
  useEffect(() => {
    if (currentPage === 'dashboard' && isAuthenticated && user?.id) {
      const userTier = (user.tier || '').toString().toLowerCase();
      const isSapphire = userTier === 'free' || userTier === 'sapphire';
      
      // Guard: Only refresh once per dashboard visit (tracked by user.id + page)
      const refreshKey = `${user.id}-${currentPage}`;
      if (hasRefreshedOnDashboardRef.current === refreshKey) {
        return; // Already refreshed for this user/page combination
      }
      
      if (isSapphire) {
        // Refresh credits from backend ONCE when accessing dashboard
        // This ensures credits are authoritative, not cached
        hasRefreshedOnDashboardRef.current = refreshKey;
        refreshUser().catch(err => {
          console.warn('Could not refresh user credits on dashboard access:', err);
        });
      }
    } else {
      // Reset refresh tracking when leaving dashboard
      hasRefreshedOnDashboardRef.current = '';
    }
    // FIXED: Removed refreshUser from dependencies - it's memoized and stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isAuthenticated, user?.id, user?.tier]);

  const handleNavigation = (page: string) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
    
    // For landing page, use root URL (crysgarage.studio)
    if (page === 'landing') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${page}`);
    }
  };

  const requireAuthForTier = (tierId: string) => {
    if (DEV_MODE) return false;
    if ((tierId === 'professional' || tierId === 'advanced' || tierId === 'free') && !isAuthenticated) {
      setPendingTierAccess(tierId);
      setShowAuthModal(true);
      return true; // blocked
    }
    return false;
  };

  const handleTierSelection = (tierId: string) => {
    console.log('App.tsx: handleTierSelection called with tierId:', tierId);
    console.log('App.tsx: isAuthenticated:', isAuthenticated);
    setSelectedTier(tierId);
    
    // Handle normalizer (free, no auth required)
    if (tierId === 'normalizer') {
      handleNavigation('normalizer');
      return;
    }
    
    // Handle analyzer (free, no auth required)
    if (tierId === 'analyzer') {
      handleNavigation('analyzer');
      return;
    }
    
    // Enforce auth for all paid tiers (including free tier)
    if (requireAuthForTier(tierId)) return;

    // CRITICAL: Payment modal opens ONLY when user explicitly clicks tier card AND tier-specific credits === 0
    // If tier-specific credits > 0, navigate directly to dashboard/studio
    // This is the ONLY place the payment modal should open
    if (tierId === 'free') {
      // Check free_credits - only open modal if free_credits === 0
      const freeCredits = user?.free_credits ?? 0;
      if (freeCredits === 0) {
        // User has no free tier credits - open payment modal
        setShowPaymentModal(true);
      } else {
        // User has free tier credits - navigate directly to dashboard
        handleNavigation('dashboard');
      }
    } else if (tierId === 'advanced') {
      // Check advanced_credits - only open modal if advanced_credits === 0
      const advancedCredits = user?.advanced_credits ?? 0;
      if (advancedCredits === 0) {
        // User has no advanced tier credits - open payment modal
        setShowPaymentModal(true);
      } else {
        // User has advanced tier credits - navigate directly to advanced dashboard
        handleNavigation('advanced');
      }
    } else if (tierId === 'professional') {
      // Professional tier: no payment on card click, payment happens at download
      handleNavigation('professional');
    } else {
      handleNavigation('dashboard');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    
    // CRITICAL: Payment modal opens ONLY when user explicitly clicks tier card AND credits === 0
    // Do NOT auto-open payment modal after auth success
    // User must explicitly click tier card to trigger payment flow
    if (pendingTierAccess) {
      // User was trying to access a tier - check tier-specific credits
      if (pendingTierAccess === 'free') {
        const freeCredits = user?.free_credits ?? 0;
        if (freeCredits < 1) {
          // User has no free tier credits - open payment modal for free tier
          setSelectedTier('free');
          setShowPaymentModal(true);
        } else {
          // User has free tier credits - navigate directly to dashboard
          handleNavigation('dashboard');
        }
      } else if (pendingTierAccess === 'advanced') {
        const advancedCredits = user?.advanced_credits ?? 0;
        if (advancedCredits < 1) {
          // User has no advanced tier credits - open payment modal for advanced tier
          setSelectedTier('advanced');
          setShowPaymentModal(true);
        } else {
          // User has advanced tier credits - navigate directly to advanced dashboard
          handleNavigation('advanced');
        }
      }
      setPendingTierAccess(null);
    } else {
      // Navigate to studio page after sign in/sign up
      handleNavigation('studio');
    }
  };

  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };

  const handlePaymentSuccess = (credits: number) => {
    // CRITICAL: Do NOT navigate or unlock access here.
    // Payment success only adds credits to backend.
    // Access is granted automatically when credits > 0 (checked in route guards).
    // Close modal - user can navigate manually once credits are updated.
    setShowPaymentModal(false);
    
    // Refresh user profile to get updated credits from backend
    // This will trigger re-render and credit-based access checks
    if (user?.id) {
      // Profile refresh will happen automatically via updateProfile in PaymentSuccessPage
      // Just close the modal - access is credit-based, not payment-based
    }
  };

  const handleDownloadAttempt = () => {
    // CRITICAL: Dev mode does NOT bypass credit checks
    // Dev mode may bypass payment verification, but access is still credit-based
    
    if (!isAuthenticated) {
      setPendingTierAccess('free');
      setShowAuthModal(true);
      return false;
    }
    
    // CRITICAL: Check free tier credits for download attempt
    // free_credits >= 1 → allow, free_credits < 1 → deny
    const freeCredits = user?.free_credits ?? 0;
    if (freeCredits >= 1) {
      return true;
    }
    
    // User needs to buy free tier credits
    setSelectedTier('free');
    setShowPaymentModal(true);
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crys-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-crys-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crys-black text-crys-white">
      {/* <MaintenanceBanner /> */}
      <Header 
        onNavigate={handleNavigation}
        onShowProfile={() => handleNavigation('profile')}
        onDownloadAttempt={handleDownloadAttempt}
        onShowAuthModal={handleShowAuthModal}
      />

      <main className="pt-20">
        {currentPage === 'dev' && (
          <DevAccess />
        )}
        {currentPage === 'landing' && (
          <LandingPage 
            onGetStarted={() => handleNavigation('dashboard')}
            onTryAnalyzer={() => handleNavigation('analyzer')}
            onTryNormalizer={() => handleNavigation('normalizer')}
            onGoToStudio={() => handleNavigation('studio')}
          />
        )}

        {currentPage === 'studio' && (
          <PricingPage 
            onSelectTier={handleTierSelection}
            onGoToDashboard={() => handleNavigation('dashboard')}
          />
        )}

    {currentPage === 'normalizer' && (
      <NormalizerPage 
        onBack={() => handleNavigation('studio')}
      />
    )}
    
    {currentPage === 'analyzer' && (
      <AnalyzerPage 
        onBack={() => handleNavigation('studio')}
      />
    )}

        {currentPage === 'dashboard' && (
          // Free tier dashboard: ALWAYS check free_credits regardless of user's tier
          (() => {
            if (isAuthenticated && user) {
              // CRITICAL: Check free_credits for ALL users trying to access free tier
              // Even if user has advanced tier, they need free_credits to access free tier
              const freeCredits = user.free_credits ?? 0;
              if (freeCredits < 1) {
                return (
                  <div className="min-h-screen bg-crys-black flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                      <h2 className="text-2xl font-bold text-crys-white mb-4">Free Tier Credits Required</h2>
                      <p className="text-crys-light-grey mb-6">
                        You need at least 1 Free tier credit to access the Free tier dashboard. Purchase Free tier credits to continue.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedTier('free');
                          setShowPaymentModal(true);
                        }}
                        className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold px-6 py-3 rounded-lg"
                      >
                        Purchase Free Tier Credits
                      </button>
                    </div>
                  </div>
                );
              }
            } else if (!isAuthenticated) {
              // Not authenticated - show auth modal
              return (
                <div className="min-h-screen bg-crys-black flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-crys-white mb-4">Sign In Required</h2>
                    <p className="text-crys-light-grey mb-6">
                      Please sign in to access the Free tier dashboard.
                    </p>
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                      }}
                      className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold px-6 py-3 rounded-lg"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              );
            }
            // Free tier credits >= 1: Allow dashboard access
            return <FreeTierDashboard />;
          })()
        )}

        {currentPage === 'professional' && (
          // Emerald: Always accessible - no credits needed (pay-per-download)
          <ProfessionalTierDashboard 
            onDownloadAttempt={handleDownloadAttempt}
          />
        )}

        {currentPage === 'advanced' && (
          // Advanced tier dashboard: ALWAYS check advanced_credits regardless of user's tier
          (() => {
            if (isAuthenticated && user) {
              // CRITICAL: Check advanced_credits for ALL users trying to access advanced tier
              // Even if user has free tier, they need advanced_credits to access advanced tier
              const advancedCredits = user.advanced_credits ?? 0;
              if (advancedCredits < 1) {
                return (
                  <div className="min-h-screen bg-crys-black flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                      <h2 className="text-2xl font-bold text-crys-white mb-4">Advanced Tier Credits Required</h2>
                      <p className="text-crys-light-grey mb-6">
                        You need at least 1 Advanced tier credit to use the Advanced tier dashboard. Purchase Advanced tier credits to continue.
                      </p>
                      <button
                        onClick={() => {
                          // CRITICAL: Explicit user action - user clicked "Purchase Credits" button
                          // This is the ONLY way payment modal opens
                          setSelectedTier('advanced');
                          setShowPaymentModal(true);
                        }}
                        className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold px-6 py-3 rounded-lg"
                      >
                        Purchase Advanced Tier Credits
                      </button>
                    </div>
                  </div>
                );
              }
            } else if (!isAuthenticated) {
              // Not authenticated - show auth modal
              return (
                <div className="min-h-screen bg-crys-black flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-crys-white mb-4">Sign In Required</h2>
                    <p className="text-crys-light-grey mb-6">
                      Please sign in to access the Advanced tier dashboard.
                    </p>
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                      }}
                      className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold px-6 py-3 rounded-lg"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              );
            }
            // Advanced tier credits >= 1: Allow dashboard access
            return <AdvancedTierDashboard />;
          })()
        )}

        {/* Free tier now uses FreeTierDashboard component */}

        {currentPage === 'profile' && (
          <ProfilePage 
            onNavigate={handleNavigation}
          />
        )}

        {currentPage === 'billing' && (
          <BillingPage 
            onNavigate={handleNavigation}
          />
        )}

        {currentPage === 'help' && (
          <HelpPage 
            onGetStarted={() => handleNavigation('studio')}
          />
        )}

        {/* {currentPage === 'courses' && (
          <CoursesPage 
            onGetStarted={() => handleNavigation('studio')}
          />
        )} */}

        {currentPage === 'marketplace' && (
          <AddonsMarketplace 
            onClose={() => handleNavigation('landing')}
            onPurchase={() => {}}
            userTier={user?.tier || 'free'}
          />
        )}

        {currentPage === 'forum' && (
          <MainForumSection />
        )}

        {currentPage === 'about' && (
          <AboutUs />
        )}

        {currentPage === 'payment-success' && (
          <PaymentSuccessPage 
            onNavigate={handleNavigation}
          />
        )}

        {/* Legal and Support Pages */}
        {currentPage === 'privacy' && (
          <PrivacyPolicy />
        )}

        {currentPage === 'terms' && (
          <TermsOfService />
        )}

        {currentPage === 'cookies' && (
          <CookiePolicy />
        )}

        {currentPage === 'support' && (
          <Support />
        )}


        {currentPage === 'careers' && (
          <Careers />
        )}

        {currentPage === 'ml-pipeline' && (
          <MLPipelineTestPage />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      <Footer onNavigate={handleNavigation} />

      {/* Dev Mode Toggle (only in development) */}
      <DevModeToggle />

      {/* Dev Mode Badge (shows when dev mode is active) */}
      <DevModeBadge />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingTierAccess(null);
        }}
        onSuccess={handleAuthSuccess}
        selectedTier={pendingTierAccess || undefined}
      />

      {/* Payment Modal */}
      {/* CRITICAL: PaymentModal is controlled ONLY by explicit user actions */}
      {/* It opens when user clicks tier card with credits === 0, or "Buy Credits" button */}
      {/* It NEVER auto-opens based on credits, auth state, or page navigation */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          // CRITICAL: Modal must always be closable
          // Closing modal does NOT trigger any side effects
          setShowPaymentModal(false);
        }}
        selectedTier={selectedTier}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
      {/* Hidden Developer Deployment Indicator - Press Ctrl+Shift+D to toggle */}
      <DevDeploymentIndicator />
    </div>
  );
}

function App() {
  return (
    <AuthenticationProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthenticationProvider>
  );
}

export default App;