import React, { useState, useEffect } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './contexts/FirebaseAuthContext';
import { FirebaseAuthModal, UserDropdown, PaymentModal } from './components/authentication';
import { LandingPage } from './components/LandingPage';
import { PricingPage } from './components/PricingPage';
import { HelpPage } from './components/HelpPage';
// import { CoursesPage } from './components/CoursesPage';
import { AddonsMarketplace } from './components/AddonsMarketplace';
import FreeTierDashboard from './components/FreeTier/FreeTierDashboard';
import ProfessionalTierDashboard from './components/ProfessionalTierDashboard';
import AdvancedTierDashboard from './components/AdvancedTierDashboard';
import Header from './components/HeaderFirebase';

// Main App Component with Firebase Auth
const AppContent: React.FC = () => {
  const {
    user,
    isAuthenticated,
    showAuthModal,
    hideAuthModal,
    showPaymentModal,
    hidePaymentModal,
    pendingTierAccess,
    setPendingTierAccess,
    paymentDetails,
    setPaymentDetails
  } = useFirebaseAuth();

  const [currentPage, setCurrentPage] = useState('landing');

  // Debug logging
  useEffect(() => {
    console.log('App.tsx: Current page changed to:', currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('App.tsx: Modal states - showAuthModal:', showAuthModal, 'showPaymentModal:', showPaymentModal);
  }, [showAuthModal, showPaymentModal]);

  const handleTierSelection = (tierId: string) => {
    console.log('App.tsx: handleTierSelection called with tierId:', tierId);
    console.log('App.tsx: isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('App.tsx: User not authenticated, showing AuthModal');
      setPendingTierAccess(tierId);
      // We need to trigger the auth modal - this will be handled by the context
    } else {
      console.log('App.tsx: User authenticated, showing PaymentModal');
      setPaymentDetails({ tier: tierId, amount: getTierAmount(tierId) });
      // We need to trigger the payment modal - this will be handled by the context
    }
  };

  const getTierAmount = (tierId: string): number => {
    switch (tierId) {
      case 'professional': return 29;
      case 'advanced': return 99;
      default: return 0;
    }
  };

  const handlePaymentSuccess = (credits: number) => {
    console.log('App.tsx: Payment successful, credits added:', credits);
    hidePaymentModal();
    setPendingTierAccess(null);
    setPaymentDetails(null);
  };

  const handleShowAuthModal = () => {
    console.log('App.tsx: handleShowAuthModal called');
    // This will be handled by the FirebaseAuthContext
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage 
          onGetStarted={() => setCurrentPage('pricing')} 
          onTryMastering={() => setCurrentPage('dashboard')} 
        />;
      case 'pricing':
        return <PricingPage 
          onSelectTier={handleTierSelection} 
          onGoToDashboard={() => setCurrentPage('dashboard')} 
          currentTier={user?.tier}
        />;
      case 'help':
        return <HelpPage onGetStarted={() => setCurrentPage('pricing')} />;
      // case 'courses':
      //   return <CoursesPage onGetStarted={() => setCurrentPage('pricing')} />;
      case 'addons':
        return <AddonsMarketplace 
          onClose={() => setCurrentPage('landing')} 
          onPurchase={() => setCurrentPage('pricing')} 
          userTier={user?.tier || 'free'} 
        />;
      case 'dashboard':
        if (user?.tier === 'pro') {
          return <ProfessionalTierDashboard />;
        } else if (user?.tier === 'advanced') {
          return <AdvancedTierDashboard />;
        } else {
          return <FreeTierDashboard />;
        }
      default:
        return <LandingPage 
          onGetStarted={() => setCurrentPage('pricing')} 
          onTryMastering={() => setCurrentPage('dashboard')} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-crys-dark-grey">
      <Header 
        onNavigate={setCurrentPage}
        onShowAuthModal={handleShowAuthModal}
      />
      
      <main>
        {renderPage()}
      </main>

      {/* Firebase Auth Modal */}
      <FirebaseAuthModal
        isOpen={showAuthModal}
        onClose={hideAuthModal}
        selectedTier={pendingTierAccess || undefined}
      />

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={hidePaymentModal}
          selectedTier={paymentDetails?.tier || 'free'}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

// App Wrapper with Firebase Auth Provider
const App: React.FC = () => {
  return (
    <FirebaseAuthProvider>
      <AppContent />
    </FirebaseAuthProvider>
  );
};

export default App;
