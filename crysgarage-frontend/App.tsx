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
import { ProfilePage } from './components/ProfilePage';
// Removed legacy SimpleCheckout modal in favor of direct Paystack redirect
import { PaymentSuccessPage } from './components/Payment/PaymentSuccessPage';
import googleAuthService from './services/googleAuth';

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
    clearError,
    updateUser
  } = useApp();

  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'dashboard' | 'professional' | 'advanced' | 'processing' | 'results' | 'studio' | 'help' | 'help-center' | 'courses' | 'marketplace' | 'profile' | 'admin' | 'community' | 'about' | 'login' | 'signup' | 'billing' | 'payment-success'>('landing');

  // Handle URL-based routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      console.log('URL changed to:', path);
      console.log('URL search params:', searchParams.toString());
      
      // Check for payment success callback
      if (searchParams.get('payment') === 'success') {
        const tier = searchParams.get('tier');
        const credits = searchParams.get('credits');
        
        console.log('Payment success detected:', { tier, credits });
        
        // Show success message and update credits
        if (tier && credits) {
          // Update user credits
          if (user) {
            const updatedUser = { ...user, credits: (user.credits || 0) + parseInt(credits) };
            updateUser(updatedUser);
            localStorage.setItem('crysgarage_user', JSON.stringify(updatedUser));
          }
          
          // Show success message
          alert(`Payment successful! ${credits} credits have been added to your account.`);
          
          // Clean up URL
          window.history.replaceState({}, '', '/billing');
        }
      }
      
      if (path === '/billing') {
        setCurrentPage('billing');
      } else if (path === '/payment-success') {
        setCurrentPage('payment-success');
      } else if (path === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (path === '/professional') {
        // Dev bypass
        if (!isAuthenticated) {
          try {
            const existing = localStorage.getItem('crysgarage_user');
            if (!existing) {
              const devUser = { id: 9, name: 'Crys Garage', email: 'dev@crysgarage.studio', tier: 'advanced' as const, credits: 9999, join_date: new Date().toISOString(), total_tracks: 0, total_spent: 0 };
              localStorage.setItem('crysgarage_user', JSON.stringify(devUser));
              localStorage.setItem('crysgarage_token', 'dev-local-token');
              updateUser(devUser);
              console.log('Dev bypass: signed in as Crys Garage');
            }
          } catch {}
        }
        setCurrentPage('professional');
      } else if (path === '/advanced') {
        // Dev bypass
        if (!isAuthenticated) {
          try {
            const existing = localStorage.getItem('crysgarage_user');
            if (!existing) {
              const devUser = { id: 9, name: 'Crys Garage', email: 'dev@crysgarage.studio', tier: 'advanced' as const, credits: 9999, join_date: new Date().toISOString(), total_tracks: 0, total_spent: 0 };
              localStorage.setItem('crysgarage_user', JSON.stringify(devUser));
              localStorage.setItem('crysgarage_token', 'dev-local-token');
              updateUser(devUser);
              console.log('Dev bypass: signed in as Crys Garage');
            }
          } catch {}
        }
        setCurrentPage('advanced');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/signup') {
        setCurrentPage('signup');
      } else if (path === '/studio') {
        setCurrentPage('studio');
      } else if (path === '/help') {
        setCurrentPage('help');
      } else if (path === '/courses') {
        setCurrentPage('courses');
      } else if (path === '/marketplace') {
        setCurrentPage('marketplace');
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/community') {
        setCurrentPage('community');
      } else if (path === '/about') {
        setCurrentPage('about');
      } else {
        setCurrentPage('landing');
      }
    };

    // Handle initial page load
    handlePopState();

    // Listen for browser back/forward buttons
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, updateUser]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('free');

  const [pendingTierAccess, setPendingTierAccess] = useState<string | null>(null);
  const [showPaymentForTier, setShowPaymentForTier] = useState<string | null>(null);
  const [showPaymentForDownload, setShowPaymentForDownload] = useState(false);

  const handleNavigation = (section: string) => {
    console.log('Navigation requested to:', section);
    console.log('Current page:', currentPage);
    console.log('User authenticated:', !!user);
    
    if (section === 'landing' || section === 'home') {
      setCurrentPage('landing');
      window.history.pushState({}, '', '/');
      return;
    }
    setCurrentPage(section as any);
    window.history.pushState({}, '', `/${section}`);
  };

  // Map helper for payment modal
  const toPaymentTier = (tierId: string): 'free' | 'pro' | 'advanced' => {
    if (tierId === 'professional') return 'pro';
    if (tierId === 'advanced') return 'advanced';
    return 'free';
  };

  const handleTierSelection = (tierId: string) => {
    setSelectedTier(tierId);
    switch (tierId) {
      case 'free':
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/dashboard');
        break;
      case 'professional':
      case 'advanced':
        if (!isAuthenticated) {
          // Dev bypass to allow direct access without auth
          try {
            const existing = localStorage.getItem('crysgarage_user');
            if (!existing) {
              const devUser = { id: 9, name: 'Crys Garage', email: 'dev@crysgarage.studio', tier: 'advanced' as const, credits: 9999, join_date: new Date().toISOString(), total_tracks: 0, total_spent: 0 };
              localStorage.setItem('crysgarage_user', JSON.stringify(devUser));
              localStorage.setItem('crysgarage_token', 'dev-local-token');
              updateUser(devUser);
            }
          } catch {}
          setPendingTierAccess(tierId);
          setCurrentPage('signup');
          window.history.pushState({}, '', '/signup');
        } else {
          // Dev account bypass - skip payment for Crys Garage
          if (user?.email === 'dev@crysgarage.studio') {
            console.log('Dev account detected, bypassing payment for:', tierId);
            if (tierId === 'professional') {
              setCurrentPage('professional');
              window.history.pushState({}, '', '/professional');
            } else if (tierId === 'advanced') {
              setCurrentPage('advanced');
              window.history.pushState({}, '', '/advanced');
            }
            return;
          }
          setShowPaymentForTier(toPaymentTier(tierId));
        }
        break;
      default:
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/dashboard');
    }
  };

  const handleDownloadAttempt = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      window.history.pushState({}, '', '/login');
      return false;
    }
    if (user?.credits && user.credits > 0) return true;
    
    // Show payment modal for download credits
    setShowPaymentForDownload(true);
    return false;
  };

  const handleAuthSuccess = async (userData: any) => {
    try {
      localStorage.setItem('crysgarage_user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('crysgarage_token', userData.token);
      updateUser(userData);

      if (pendingTierAccess) {
        setShowPaymentForTier(toPaymentTier(pendingTierAccess));
        setPendingTierAccess(null);
        return;
      }

      setCurrentPage('dashboard');
      window.history.pushState({}, '', '/dashboard');
    } catch (error) {
      console.error('Auth state update failed:', error);
    }
  };

  const handleTierPaymentSuccess = (credits: number) => {
    const tierKey = showPaymentForTier || toPaymentTier(selectedTier);
    setShowPaymentForTier(null);
    if (tierKey === 'pro') {
      setCurrentPage('professional');
      window.history.pushState({}, '', '/professional');
    } else if (tierKey === 'advanced') {
      setCurrentPage('advanced');
      window.history.pushState({}, '', '/advanced');
    }
  };

  const handleDownloadPaymentSuccess = (credits: number) => {
    setShowPaymentForDownload(false);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForTier(null);
    setShowPaymentForDownload(false);
  };

  const handleSignOut = async () => {
    try { await signOut?.(); } catch {}
    try { localStorage.removeItem('crysgarage_user'); } catch {}
    try { localStorage.removeItem('crysgarage_token'); } catch {}
    setCurrentPage('landing');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <Header 
        user={user}
        onSignOut={handleSignOut}
        onNavigate={handleNavigation}
        onShowProfile={() => setCurrentPage('profile')}
      />

      <main className="pt-20">
        {(currentPage === 'landing' || currentPage === 'home') && (
          <LandingPage 
            onGetStarted={() => handleNavigation('studio')}
            onTryMastering={() => { setCurrentPage('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
          />
        )}

        {currentPage === 'dashboard' && (
          <FreeTierDashboard onDownloadAttempt={handleDownloadAttempt} />
        )}

        {currentPage === 'professional' && (
          isAuthenticated ? (
            user?.credits && user.credits > 0 ? (
              <ProfessionalTierDashboard onFileUpload={() => {}} credits={user?.credits || 0} />
            ) : (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md mx-auto p-6">
                  <h2 className="text-white text-xl font-semibold mb-4">Purchase Credits Required</h2>
                  <p className="text-gray-400 mb-6">You need to purchase credits to access the Professional tier features.</p>
                  <button onClick={() => setShowPaymentForTier('pro')} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-2 rounded-lg font-semibold">Purchase Credits</button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md mx-auto p-6">
                <h2 className="text-white text-xl font-semibold mb-4">Authentication Required</h2>
                <p className="text-gray-400 mb-6">Please sign in to access the Professional tier features.</p>
                <button onClick={() => { setPendingTierAccess('professional'); setCurrentPage('signup'); }} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-2 rounded-lg font-semibold">Get Access</button>
              </div>
            </div>
          )
        )}

        {currentPage === 'advanced' && (
          isAuthenticated ? (
            user?.credits && user.credits > 0 ? (
              <AdvancedTierDashboard onFileUpload={() => {}} />
            ) : (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md mx-auto p-6">
                  <h2 className="text-white text-xl font-semibold mb-4">Purchase Credits Required</h2>
                  <p className="text-gray-400 mb-6">You need to purchase credits to access the Advanced tier features.</p>
                  <button onClick={() => setShowPaymentForTier('advanced')} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-2 rounded-lg font-semibold">Purchase Credits</button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md mx-auto p-6">
                <h2 className="text-white text-xl font-semibold mb-4">Authentication Required</h2>
                <p className="text-gray-400 mb-6">Please sign in to access the Advanced tier features.</p>
                <button onClick={() => { setPendingTierAccess('advanced'); setCurrentPage('signup'); }} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-2 rounded-lg font-semibold">Get Access</button>
              </div>
            </div>
          )
        )}

        {currentPage === 'studio' && (
          <PricingPage currentTier={user?.tier || 'free'} onSelectTier={handleTierSelection} onGoToDashboard={() => setCurrentPage('studio')} />
        )}

        {(currentPage === 'help' || currentPage === 'help-center') && (<HelpPage onGetStarted={() => setCurrentPage('studio')} />)}
        {currentPage === 'courses' && (<CoursesPage onGetStarted={() => setCurrentPage('studio')} />)}
        {currentPage === 'marketplace' && (<AddonsMarketplace onClose={() => setCurrentPage('studio')} onPurchase={() => {}} userTier={user?.tier || 'free'} />)}
        {currentPage === 'admin' && (<AdminDashboard onBack={() => setCurrentPage('landing')} />)}
        {currentPage === 'community' && (<CommunityPage currentUser={user} />)}
        {currentPage === 'about' && (<AboutUs />)}
        {currentPage === 'profile' && (<ProfilePage onNavigate={handleNavigation} />)}

        {currentPage === 'login' && (
          <AuthPage mode="login" selectedTier={pendingTierAccess || 'free'} onAuthSuccess={handleAuthSuccess} onPaymentSuccess={() => setCurrentPage('dashboard')} onBack={() => setCurrentPage('landing')} />
        )}
        {currentPage === 'signup' && (
          <AuthPage mode="signup" selectedTier={pendingTierAccess || 'free'} onAuthSuccess={handleAuthSuccess} onPaymentSuccess={() => setCurrentPage('dashboard')} onBack={() => setCurrentPage('landing')} />
        )}

        {currentPage === 'billing' && (<BillingPage onNavigate={handleNavigation} />)}
        {currentPage === 'payment-success' && (<PaymentSuccessPage onNavigate={handleNavigation} />)}
      </main>

      <Footer onNavigate={handleNavigation} />

      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} isOpen={showPaymentModal} selectedTier="professional" onPaymentSuccess={() => { setShowPaymentModal(false); setCurrentPage('studio'); }} />
      )}

      {showProfileEditModal && (
        <ProfileEditModal onClose={() => setShowProfileEditModal(false)} userData={{ name: user?.name || 'User', email: user?.email || '', tier: user?.tier || 'free', joinDate: user?.join_date || '', totalTracks: 0, totalSpent: 0, isSignedIn: !!user }} onSave={() => { setShowProfileEditModal(false); setCurrentPage('studio'); }} />
      )}

      {/* Direct Paystack redirect used; modal removed */}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;