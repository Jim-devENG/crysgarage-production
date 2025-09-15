import React, { useState, useEffect } from 'react';
import { AuthenticationProvider, useAuth } from './contexts/AuthenticationContext';
import { LandingPage } from './components/LandingPage';
import { FreeTierDashboard } from './components/FreeTier';
import FreeTierDashboardPython from './components/FreeTier/FreeTierDashboardPython';
import ProfessionalTierDashboard from './components/ProfessionalTierDashboard';
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
import { CommunityPage } from './components/CommunityPage';
import AboutUs from './components/AboutUs';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';
import MLPipelineTestPage from './components/MLPipelineTestPage';
import { BillingPage } from './components/Billing/BillingPage';
import { ProfilePage } from './components/ProfilePage';
import { PaymentSuccessPage } from './components/Payment/PaymentSuccessPage';
import { AuthModal, UserDropdown, PaymentModal } from './components/authentication';
import { DEV_MODE, logDevAction } from './utils/devMode';
import { DevModeToggle } from './components/DevModeToggle';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CookiePolicy from './components/CookiePolicy';
import Support from './components/Support';
import Careers from './components/Careers';
import DevAccess from './components/DevAccess';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [pendingTierAccess, setPendingTierAccess] = useState<string | null>(null);

  // Handle URL routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1) || 'landing';
      setCurrentPage(path);
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Initial load

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Debug current page
  useEffect(() => {
    console.log('Current page changed to:', currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('Modal states - showAuthModal:', showAuthModal, 'showPaymentModal:', showPaymentModal);
  }, [showAuthModal, showPaymentModal]);

  const handleNavigation = (page: string) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page}`);
  };

  const handleTierSelection = (tierId: string) => {
    console.log('App.tsx: handleTierSelection called with tierId:', tierId);
    console.log('App.tsx: isAuthenticated:', isAuthenticated);
    setSelectedTier(tierId);
    
    if (DEV_MODE) {
      // In Dev Mode, bypass authentication and payment
      logDevAction(`Tier selection bypassed - granting access to ${tierId} tier`);
      handlePaymentSuccess(tierId === 'free' ? 1 : tierId === 'professional' ? 5 : 6);
      return;
    }
    
    if (!isAuthenticated) {
      // User needs to authenticate first
      console.log('App.tsx: User not authenticated, showing AuthModal');
      setPendingTierAccess(tierId);
      setShowAuthModal(true);
    } else {
      // User is authenticated, show payment modal
      console.log('App.tsx: User authenticated, showing PaymentModal');
      setShowPaymentModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    
    if (pendingTierAccess) {
      // Show payment modal after authentication
      setShowPaymentModal(true);
      setPendingTierAccess(null);
    } else {
      // Navigate to dashboard
      handleNavigation('dashboard');
    }
  };

  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };

  const handlePaymentSuccess = (credits: number) => {
    setShowPaymentModal(false);
    
    // Navigate to appropriate dashboard based on tier
    if (selectedTier === 'free') {
      handleNavigation('dashboard');
    } else if (selectedTier === 'professional') {
      handleNavigation('professional');
    } else if (selectedTier === 'advanced') {
      handleNavigation('advanced');
    } else {
      handleNavigation('dashboard');
    }
  };

  const handleDownloadAttempt = () => {
    if (DEV_MODE) {
      // In Dev Mode, always allow downloads
      logDevAction('Download attempt bypassed - allowing download');
      return true;
    }
    
    if (!isAuthenticated) {
      setPendingTierAccess('free');
      setShowAuthModal(true);
      return false;
    }
    
    if (user?.credits && user.credits > 0) {
      return true;
    }
    
    // User needs to buy credits
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
        {(currentPage === 'landing' || currentPage === 'home') && (
          <LandingPage 
            onGetStarted={() => handleNavigation('studio')}
            onTryMastering={() => handleNavigation('studio')}
          />
        )}

        {currentPage === 'studio' && (
          <PricingPage 
            onSelectTier={handleTierSelection}
            onGoToDashboard={() => handleNavigation('dashboard')}
          />
        )}

        {currentPage === 'dashboard' && (
          <FreeTierDashboardPython 
            onDownloadAttempt={handleDownloadAttempt}
          />
        )}

        {currentPage === 'professional' && (
          <ProfessionalTierDashboard />
        )}

        {currentPage === 'advanced' && (
          <AdvancedTierDashboard />
        )}

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

        {currentPage === 'community' && (
          <CommunityPage />
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
      </main>

      <Footer onNavigate={handleNavigation} />

      {/* Dev Mode Toggle (only in development) */}
      <DevModeToggle />

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
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedTier}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <AuthenticationProvider>
      <AppContent />
    </AuthenticationProvider>
  );
}

export default App;