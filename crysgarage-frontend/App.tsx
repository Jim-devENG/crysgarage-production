import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthPages';
import { FreeTierDashboard } from './components/FreeTierDashboard';
import { ProfessionalTierDashboard } from './components/ProfessionalTierDashboard';
import { AdvancedTierDashboard } from './components/AdvancedTierDashboard';
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
  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'dashboard' | 'processing' | 'results' | 'pricing' | 'help' | 'courses' | 'marketplace' | 'profile' | 'admin'>('landing');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('free'); // Add selected tier state 

  // URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    console.log('Current path:', path);
    
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/dashboard') {
      setCurrentPage('dashboard');
    } else if (path === '/pricing') {
      setCurrentPage('pricing');
    } else if (path === '/help') {
      setCurrentPage('help');
    } else if (path === '/courses') {
      setCurrentPage('courses');
    } else if (path === '/profile') {
      setCurrentPage('profile');
    } else if (path === '/') {
      setCurrentPage('landing');
    }
  }, []);

  // Handle navigation with proper type conversion
  const handleNavigation = (section: string) => {
    console.log('Navigation requested to:', section);
    if (section === 'landing' || section === 'home' || section === 'dashboard' || section === 'processing' || 
        section === 'results' || section === 'pricing' || section === 'help' || 
        section === 'courses' || section === 'marketplace' || section === 'profile' || section === 'admin') {
          console.log('Setting current page to:', section);
          setCurrentPage(section);
    }
  };

  // Handle tier selection
  const handleTierSelection = (tierId: string) => {
    setSelectedTier(tierId);
    
    if (tierId === 'free') {
      // For free tier, allow access to dashboard even for non-authenticated users
      setCurrentPage('dashboard');
    } else {
      // For paid tiers, require authentication
      setAuthMode('signup');
      setShowAuthModal(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-crys-white text-xl font-semibold">Loading Crys Garage...</h2>
          <p className="text-crys-light-grey mt-2">Preparing your audio mastering experience</p>
          </div>
          </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black flex items-center justify-center p-4">
        <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-crys-white text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-crys-light-grey mb-4">{error}</p>
          <button
            onClick={clearError}
            className="bg-crys-gold text-crys-black px-6 py-2 rounded-lg font-semibold hover:bg-crys-gold/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Authenticated user - show dashboard
  if (isAuthenticated && user) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black relative">
        {/* Background overlay to cover gaps */}
        <div className="absolute inset-0 bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black -z-10" style={{ top: '-80px', height: 'calc(100% + 80px)' }}></div>
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
            <>
              {user.tier === 'free' && (
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
              {user.tier === 'pro' && (
                <ProfessionalTierDashboard 
                  onFileUpload={(file) => {
                    // Handle file upload for professional tier
                    console.log('Professional tier file upload:', file);
                    // You can add upload logic here or call a function from context
                  }}
                  credits={user.credits || 0}
                />
              )}
              {user.tier === 'advanced' && (
                <AdvancedTierDashboard 
                  onFileUpload={(file) => {
                    // Handle file upload for advanced tier
                    console.log('Advanced tier file upload:', file);
                    // You can add upload logic here or call a function from context
                  }}
                />
              )}
            </>
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
          
          {currentPage === 'pricing' && (
            <PricingPage 
              currentTier={user.tier}
              onSelectTier={handleTierSelection}
              onGoToDashboard={() => setCurrentPage('dashboard')}
            />
          )}
          
          {currentPage === 'help' && (
            <HelpPage 
              onGetStarted={() => setShowAuthModal(true)}
            />
          )}
          
            {currentPage === 'courses' && (
              <CoursesPage 
              onGetStarted={() => setShowAuthModal(true)}
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
                </div>
    );
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black relative">
        {/* Background overlay to cover gaps */}
        <div className="absolute inset-0 bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black -z-10" style={{ top: '-80px', height: 'calc(100% + 80px)' }}></div>
      <Header 
        user={null}
        onNavigate={handleNavigation}
        onShowBilling={() => setShowAuthModal(true)}
        onShowProfile={() => setShowAuthModal(true)}
      />
      
      <main className="pt-20">
        {currentPage === 'landing' && (
          <LandingPage 
            onGetStarted={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            onTryMastering={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
          />
        )}
      
      {currentPage === 'home' && (
        <LandingPage 
          onGetStarted={() => {
            setAuthMode('signup');
            setShowAuthModal(true);
          }}
          onTryMastering={() => {
            setAuthMode('signin');
            setShowAuthModal(true);
          }}
        />
      )}
      
      {currentPage === 'pricing' && (
        <PricingPage 
          currentTier="free"
          onSelectTier={handleTierSelection}
          onGoToDashboard={() => setCurrentPage('dashboard')}
        />
      )}
      
      {currentPage === 'help' && (
        <HelpPage 
          onGetStarted={() => setShowAuthModal(true)}
        />
      )}
      
        {currentPage === 'courses' && (
          <CoursesPage 
            onGetStarted={() => setShowAuthModal(true)}
          />
        )}
        
        {currentPage === 'dashboard' && !isAuthenticated && (
          <FreeTierDashboard 
            onFileUpload={(file) => {
              // For non-authenticated users, prompt them to sign up
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            onUpgrade={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            credits={3} // Default free tier credits
            isAuthenticated={false} // Pass authentication status
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard onBack={() => setCurrentPage('landing')} />
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