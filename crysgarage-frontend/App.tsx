import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { useAudioUpload } from './hooks/useAudioUpload';
import { useCredits } from './hooks/useCredits';
import { useAddons } from './hooks/useAddons';
import { useMasteringControls } from './hooks/useMasteringControls';
import { audioAPI, authAPI, creditsAPI, API_BASE_URL } from './services/api';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { CoursesPage } from './components/CoursesPage';
import { HelpPage } from './components/HelpPage';
import { UserProfile } from './components/UserProfile';
import { AuthModal } from './components/AuthPages';
import { FreeTierDashboard } from './components/FreeTierDashboard';
import { ProfessionalTierDashboard } from './components/ProfessionalTierDashboard';
import { AdvancedTierDashboard } from './components/AdvancedTierDashboard';
import { PricingTiers } from './components/PricingTiers';
import { GenreSelection } from './components/GenreSelection';
import { ProcessingConfig, ProcessingConfiguration } from './components/ProcessingConfig';
import { SignalFlow } from './components/SignalFlow';
import { MasteringControls } from './components/MasteringControls';
import { MasteringResults } from './components/MasteringResults';
import { PaymentModal } from './components/PaymentModal';
import { APIIntegrationLayer } from './components/APIIntegrationLayer';
import { MobileOptimizations } from './components/MobileOptimizations';
import { AfrocentricDesignSystem } from './components/AfrocentricDesignSystem';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { ArrowLeft, Settings, Smartphone, Palette } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { AutoAuthFix } from './components/AutoAuthFix';

type AppPage = 'home' | 'pricing' | 'courses' | 'help' | 'profile' | 'auth' | 'free-dashboard' | 'professional-dashboard' | 'advanced-dashboard' | 'mastering-pricing' | 'mastering-genre' | 'mastering-config' | 'mastering-processing' | 'mastering-controls' | 'mastering-results';

interface MasteringSession {
  file: File | null;
  tier: string;
  genre: string;
  config: ProcessingConfiguration | null;
  totalCost: number;
  audioId?: string;
  masteredResult?: any;
}

function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    currentSession, 
    credits, 
    tier, 
    error,
    signIn,
    signUp,
    signOut,
    uploadFile,
    startMastering,
    getSessionStatus,
    clearError
  } = useApp();

  // Custom hooks
  const audioUpload = useAudioUpload();
  const creditsManager = useCredits(user);
  const addonsManager = useAddons(user);
  const masteringControls = useMasteringControls();

  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [intendedDestination, setIntendedDestination] = useState<AppPage | null>(null);
  const [session, setSession] = useState<MasteringSession>({
    file: null,
    tier: '',
    genre: '',
    config: null,
    totalCost: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTierForPayment, setSelectedTierForPayment] = useState<string>('');
  
  // Development tools visibility
  const [showAPILayer, setShowAPILayer] = useState(false);
  const [showDesignSystem, setShowDesignSystem] = useState(false);

  const handleNavigation = (section: string) => {
    console.log('=== NAVIGATION DEBUG ===');
    console.log('Navigating to:', section);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('currentPage:', currentPage);
    console.log('intendedDestination:', intendedDestination);
    
    // Protected routes that require authentication
    const protectedRoutes = ['pricing', 'free-dashboard', 'professional-dashboard', 'advanced-dashboard', 'profile'];
    
    if (protectedRoutes.includes(section) && !isAuthenticated) {
      // Store the intended destination and redirect to login
      console.log('Protected route, setting intended destination:', section);
      setIntendedDestination(section as AppPage);
      setAuthMode('signin');
      setCurrentPage('auth');
      return;
    }
    
    switch (section) {
      case 'home':
        setCurrentPage('home');
        break;
      case 'pricing':
        if (isAuthenticated) {
          console.log('User authenticated, going to pricing');
          setCurrentPage('pricing');
        } else {
          console.log('User not authenticated, setting intended destination to pricing');
          setIntendedDestination('pricing');
          setAuthMode('signin');
          setCurrentPage('auth');
        }
        break;
      case 'courses':
        setCurrentPage('courses');
        break;
      case 'help':
        setCurrentPage('help');
        break;
      case 'profile':
        if (isAuthenticated) {
          setCurrentPage('profile');
        } else {
          setIntendedDestination('profile');
          setAuthMode('signin');
          setCurrentPage('auth');
        }
        break;
      case 'free-dashboard':
      case 'professional-dashboard':
      case 'advanced-dashboard':
        if (isAuthenticated) {
          setCurrentPage(section);
        } else {
          setIntendedDestination(section as AppPage);
          setAuthMode('signin');
          setCurrentPage('auth');
        }
        break;
      default:
        setCurrentPage('home');
    }
    console.log('=== NAVIGATION DEBUG END ===');
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Go to appropriate dashboard based on tier
      switch (tier) {
        case 'free':
          setCurrentPage('free-dashboard');
          break;
        case 'pro':
          setCurrentPage('professional-dashboard');
          break;
        case 'advanced':
          setCurrentPage('advanced-dashboard');
          break;
        default:
          // If no tier assigned, go to pricing to select tier
          setCurrentPage('pricing');
      }
    } else {
      // Unauthenticated users go to signup
      setAuthMode('signup');
      setCurrentPage('auth');
    }
  };

  const handleTryMastering = () => {
    if (isAuthenticated) {
      // Redirect to appropriate tier workflow
      switch (tier) {
        case 'free':
          // Free tier goes directly to upload
          setCurrentPage('free-dashboard');
          break;
        case 'pro':
          // Professional tier goes to genre selection
          setCurrentPage('professional-dashboard');
          break;
        case 'advanced':
          // Advanced tier goes to manual controls
          setCurrentPage('advanced-dashboard');
          break;
        default:
          // If no tier, go to pricing
          setCurrentPage('pricing');
      }
    } else {
      // Unauthenticated users go to signup
      setAuthMode('signup');
      setCurrentPage('auth');
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log('=== LOGIN DEBUG START ===');
      console.log('Signing in with:', email);
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
      console.log('Current user state:', user);
      console.log('Current tier state:', tier);
      console.log('Current auth state:', isAuthenticated);
      
      await signIn(email, password);
      
      console.log('Sign in successful!');
      console.log('Updated user state:', user);
      console.log('Updated tier state:', tier);
      console.log('Updated auth state:', isAuthenticated);
      console.log('=== LOGIN DEBUG END ===');
      
      // The useEffect will handle redirection automatically
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Sign in failed:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('=== LOGIN ERROR END ===');
      alert('Login failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Signing up with:', email, name);
      await signUp(name, email, password);
      console.log('Sign up successful, current tier:', tier);
      // The useEffect will handle redirection automatically
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentPage('home');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Check if user has enough credits
      if (!creditsManager.canUpload) {
        throw new Error('Insufficient credits. Please upgrade your tier or purchase more credits.');
      }

      // Upload file to backend
      const uploadResult = await audioAPI.uploadFile(file, session.genre);
      const audioId = uploadResult.audio_id;
      
      console.log('File uploaded successfully, audio_id:', audioId);
      console.log('Credits deducted:', uploadResult.credits_deducted);
      console.log('Remaining credits:', uploadResult.remaining_credits);
      
      // Update credits in the UI
      if (uploadResult.credits_deducted) {
        // Refresh credits to show updated balance
        await creditsManager.refreshCredits();
      }
      
      // Set session with file and audio ID
      setSession(prev => ({
        ...prev,
        file: file,
        audioId: audioId
      }));
      
      // Different workflows based on tier
      switch (tier) {
        case 'free':
          // Free tier: Show genre selection with pricing options
          console.log('Free tier - showing genre selection with pricing');
          setCurrentPage('mastering-genre');
          break;
          
        case 'professional':
          // Professional tier: Genre selection → Quality options → Processing
          console.log('Professional tier - starting genre selection');
          setCurrentPage('mastering-genre');
          break;
          
        case 'advanced':
          // Advanced tier: Direct manual controls workflow
          console.log('Advanced tier - starting manual controls workflow');
          setCurrentPage('mastering-controls');
          break;
          
        default:
          // Default to genre selection for all tiers
          console.log('Default tier - showing genre selection');
          setCurrentPage('mastering-genre');
      }
    } catch (error: any) {
      console.error('File upload failed:', error);
      
      // Handle insufficient credits specifically
      if (error.response?.status === 402) {
        const errorData = error.response.data;
        alert(`Insufficient credits. Required: ${errorData.required}, Available: ${errorData.available}. Please upgrade your tier or purchase more credits.`);
      } else {
        // Show general error to user
        alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
      throw error;
    }
  };

  const startAutomaticMastering = async (audioId: string) => {
    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      console.log('Starting automatic mastering for audio_id:', audioId);
      
      // For free tier, use simulation instead of real API
      if (tier === 'free') {
        console.log('Using simulation for free tier');
        await simulateProcessing();
        return;
      }
      
      // For other tiers, use real API
      // Poll for status updates every 3 seconds
      const pollInterval = setInterval(async () => {
        try {
          const status = await audioAPI.getStatus(audioId);
          console.log('Status update:', status);
          
          setProcessingProgress(status.progress || 0);
          
          if (status.status === 'done') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setProcessingProgress(100);
            
            console.log('Mastering completed successfully');
            
            // Get download URLs
            const downloadUrls = await audioAPI.getDownloadUrls(audioId);
            
            // Set the mastered result
            setSession(prev => ({
              ...prev,
              masteredResult: {
                session_id: audioId,
                output_files: downloadUrls,
                download_urls: downloadUrls,
                metadata: {
                  processing_time: 120,
                  final_lufs: -14.2,
                  true_peak: -0.8,
                  dynamic_range: 12.5,
                }
              }
            }));
            
            setCurrentPage('mastering-results');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            console.error('Mastering failed:', status.error_message);
            alert('Mastering failed: ' + (status.error_message || 'Unknown error'));
          }
          // If status is 'processing' or 'pending', continue polling
        } catch (error) {
          console.error('Status polling failed:', error);
          clearInterval(pollInterval);
          setIsProcessing(false);
          alert('Failed to check processing status: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      }, 3000); // Poll every 3 seconds
      
    } catch (error) {
      console.error('Mastering failed:', error);
      setIsProcessing(false);
      alert('Mastering failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleTierSelect = (tierId: string) => {
    console.log('🎯 Tier selected:', tierId);
    
    // Check if user is trying to select Professional or Advanced tier
    if (tierId === 'professional' || tierId === 'advanced') {
      console.log('💳 Showing payment modal for tier:', tierId);
      // Show payment modal for subscription
      setSelectedTierForPayment(tierId);
      setShowPaymentModal(true);
    } else {
      console.log('🆓 Free tier selected');
      // Free tier - proceed based on current page
      setSession(prev => ({
        ...prev,
        tier: tierId
      }));
      
      // If we're on pricing page, go to dashboard. Otherwise, go to mastering workflow
      if (currentPage === 'pricing') {
        handleGetStarted();
      } else {
        setCurrentPage('mastering-genre');
      }
    }
  };

  const handlePaymentSuccess = (tierId: string, credits: number) => {
    // Update user tier and credits (in a real app, this would come from the backend)
    console.log(`✅ Payment successful for ${tierId} tier with ${credits} credits`);
    
    // Set the session tier
    setSession(prev => {
      console.log('🔄 Updating session tier from', prev.tier, 'to', tierId);
      return {
        ...prev,
        tier: tierId
      };
    });
    
    // Close payment modal
    setShowPaymentModal(false);
    setSelectedTierForPayment('');
    
    // Navigate based on current page
    if (currentPage === 'pricing') {
      // If on pricing page, go to dashboard
      handleGetStarted();
    } else {
      // If in mastering workflow, go to genre selection
      setCurrentPage('mastering-genre');
    }
  };

  const handleGenreSelect = (genreId: string, price: number) => {
    console.log('🎵 Genre selected:', genreId, 'with price:', price);
    console.log('🎯 Current session tier:', session.tier);
    
    setSession(prev => ({
      ...prev,
      genre: genreId,
      totalCost: prev.totalCost + price
    }));
    
    // Different next steps based on session tier (not global tier)
    const currentSessionTier = session.tier;
    console.log('🔄 Using session tier for routing:', currentSessionTier);
    
    switch (currentSessionTier) {
      case 'professional':
        console.log('⚡ Professional tier: going to mastering-config');
        // Professional tier: Genre → Quality Options → Processing
        setCurrentPage('mastering-config');
        break;
        
      case 'advanced':
        console.log('👑 Advanced tier: going to mastering-controls');
        // Advanced tier: Genre → Manual Controls
        setCurrentPage('mastering-controls');
        break;
        
      default:
        console.log('🆓 Default tier: going to mastering-config');
        // Default to config page
        setCurrentPage('mastering-config');
    }
  };

  const handleConfigChange = (config: ProcessingConfiguration) => {
    setSession(prev => ({
      ...prev,
      config: config
    }));
    
    // Don't automatically proceed to processing - let user click Next button
    console.log('Configuration updated:', config);
  };

  const startProcessing = () => {
    if (session.tier === 'advanced' || tier === 'advanced') {
      setCurrentPage('mastering-controls');
    } else {
      setIsProcessing(true);
      simulateProcessing();
    }
  };

  const simulateProcessing = async () => {
    if (!session.audioId) {
      console.error('No audio ID available for processing');
      return;
    }

    console.log('🎵 Starting real audio processing for:', session.audioId);
    
    try {
      // Start the mastering process
      await audioAPI.startMastering(session.audioId, {
        genre: session.genre,
        config: session.config || {
          sample_rate: 44100,
          bit_depth: 16,
          target_lufs: -14,
          true_peak: -1,
          eq_settings: {},
          compression_settings: {},
          stereo_width: 1.0
        }
      });
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await audioAPI.getStatus(session.audioId!);
          console.log('📊 Processing status:', status);
          
          setProcessingProgress(status.progress || 0);
          
          if (status.status === 'done') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setProcessingProgress(100);
            
            // Get download URLs
            const downloadUrls = await audioAPI.getDownloadUrls(session.audioId!);
            
            // Set the mastered result
            setSession(prev => ({
              ...prev,
              masteredResult: {
                session_id: session.audioId!,
                output_files: downloadUrls,
                download_urls: downloadUrls,
                metadata: status.metadata || {
                  processing_time: 180,
                  final_lufs: -14.2,
                  true_peak: -0.8,
                  dynamic_range: 12.5,
                  genre: session.genre,
                  tier: session.tier
                }
              }
            }));
            
            setCurrentPage('mastering-results');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            console.error('❌ Processing failed:', status.error_message);
            alert('Processing failed: ' + (status.error_message || 'Unknown error'));
          }
        } catch (error) {
          console.error('❌ Status polling failed:', error);
          clearInterval(pollInterval);
          setIsProcessing(false);
          alert('Failed to check processing status: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      }, 2000); // Poll every 2 seconds
      
    } catch (error) {
      console.error('❌ Processing failed:', error);
      setIsProcessing(false);
      alert('Processing failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const completeAdvancedMastering = async () => {
    try {
      if (!session.audioId) {
        throw new Error('No audio ID available for mastering');
      }
      
      console.log('Completing advanced mastering for audio_id:', session.audioId);
      
      // Get the current mastering controls from the masteringControls hook
      const currentConfig = masteringControls.getProcessingConfiguration();
      
      // Start mastering with advanced controls
      await audioAPI.startMastering(
        session.audioId,
        {
          genre: session.genre,
          config: currentConfig
        }
      );
      
      // Switch to processing page
      setCurrentPage('mastering-processing');
      setIsProcessing(true);
      setProcessingProgress(0);
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await audioAPI.getStatus(session.audioId!);
          console.log('Advanced mastering status:', status);
          
          setProcessingProgress(status.progress || 0);
          
          if (status.status === 'done') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setProcessingProgress(100);
            
            // Get download URLs
            const downloadUrls = await audioAPI.getDownloadUrls(session.audioId!);
            
            // Set the mastered result
            setSession(prev => ({
              ...prev,
              masteredResult: {
                session_id: session.audioId!,
                output_files: downloadUrls,
                download_urls: downloadUrls,
                metadata: {
                  processing_time: 180,
                  final_lufs: -14.2,
                  true_peak: -0.8,
                  dynamic_range: 12.5,
                }
              }
            }));
            
            setCurrentPage('mastering-results');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            console.error('Advanced mastering failed:', status.error_message);
            alert('Advanced mastering failed: ' + (status.error_message || 'Unknown error'));
          }
        } catch (error) {
          console.error('Advanced mastering status polling failed:', error);
          clearInterval(pollInterval);
          setIsProcessing(false);
          alert('Failed to check advanced mastering status: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      }, 3000);
      
    } catch (error) {
      console.error('Advanced mastering failed:', error);
      alert('Advanced mastering failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDownload = async (format: string) => {
    try {
      // Check tier restrictions for downloads
      if (tier === 'free') {
        alert('Download is not available in Free tier. Please upgrade to Professional or Advanced tier to download your mastered files.');
        return;
      }
      
      if (!session.audioId) {
        throw new Error('No audio ID available for download');
      }
      
      console.log(`Downloading ${session.file?.name} as ${format}`);
      
      // Use the audioAPI to download the file
      const blob = await audioAPI.downloadFile(session.audioId, format as 'wav' | 'mp3' | 'flac');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${session.file?.name?.replace(/\.[^/.]+$/, '')}_mastered.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('Download completed');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const resetWorkflow = () => {
    // Return to tier-specific dashboard
    switch (tier) {
      case 'free':
        setCurrentPage('free-dashboard');
        break;
      case 'pro':
        setCurrentPage('professional-dashboard');
        break;
      case 'advanced':
        setCurrentPage('advanced-dashboard');
        break;
      default:
        setCurrentPage('home');
    }
    
    setSession({
      file: null,
      tier: tier,
      genre: '',
      config: null,
      totalCost: 0
    });
    setIsProcessing(false);
    setProcessingProgress(0);
    audioUpload.reset();
  };

  const goBack = () => {
    const stepOrder: AppPage[] = ['mastering-pricing', 'mastering-genre', 'mastering-config', 'mastering-processing', 'mastering-controls', 'mastering-results'];
    const currentIndex = stepOrder.indexOf(currentPage);
    if (currentIndex > 0) {
      setCurrentPage(stepOrder[currentIndex - 1]);
    } else {
      // Return to tier-specific dashboard
      switch (tier) {
        case 'free':
          setCurrentPage('free-dashboard');
          break;
        case 'pro':
          setCurrentPage('professional-dashboard');
          break;
        case 'advanced':
          setCurrentPage('advanced-dashboard');
          break;
        default:
          setCurrentPage('home');
      }
    }
  };

  const handleUpgrade = () => {
    setCurrentPage('pricing');
  };

  const getStepProgress = (): number => {
    // Different step orders based on tier
    let stepOrder: AppPage[];
    
    switch (tier) {
      case 'free':
        // Free tier: Processing → Results (2 steps)
        stepOrder = ['mastering-processing', 'mastering-results'];
        break;
        
      case 'pro':
        // Professional tier: Genre → Config → Processing → Results (4 steps)
        stepOrder = ['mastering-genre', 'mastering-config', 'mastering-processing', 'mastering-results'];
        break;
        
      case 'advanced':
        // Advanced tier: Controls → Processing → Results (3 steps)
        stepOrder = ['mastering-controls', 'mastering-processing', 'mastering-results'];
        break;
        
      default:
        // Default to professional workflow
        stepOrder = ['mastering-genre', 'mastering-config', 'mastering-processing', 'mastering-results'];
    }
    
    const currentIndex = stepOrder.indexOf(currentPage);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / stepOrder.length) * 100;
  };

  const getCurrentCredits = () => {
    return creditsManager.credits;
  };

  // Monitor authentication state changes
  useEffect(() => {
    console.log('=== AUTH STATE CHANGED ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('tier:', tier);
    console.log('credits:', credits);
    console.log('=== AUTH STATE END ===');
  }, [isAuthenticated, user, tier, credits]);

  // Handle post-login redirection
  useEffect(() => {
    console.log('=== POST-LOGIN REDIRECTION DEBUG ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('currentPage:', currentPage);
    console.log('intendedDestination:', intendedDestination);
    
    if (isAuthenticated && currentPage === 'auth') {
      console.log('User authenticated, redirecting from auth page');
      if (intendedDestination) {
        console.log('Redirecting to intended destination:', intendedDestination);
        setCurrentPage(intendedDestination);
        setIntendedDestination(null);
      } else {
        console.log('No intended destination, going to home');
        setCurrentPage('home');
      }
    }
    console.log('=== POST-LOGIN REDIRECTION DEBUG END ===');
  }, [isAuthenticated, currentPage, intendedDestination]);

  // Redirect authenticated users to their dashboard when on home page
  useEffect(() => {
    if (isAuthenticated && currentPage === 'home') {
      console.log('User is authenticated, but staying on home page. Tier:', tier);
      // Don't auto-redirect, let user choose where to go
      // setCurrentPage('free-dashboard');
    }
  }, [isAuthenticated, currentPage, tier]);

  // Handle loading timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log('Loading timeout reached, forcing render');
        // Force render after 5 seconds to prevent infinite loading
        window.location.reload();
      }, 5000); // 5 second timeout
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-crys-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-crys-gold text-xl mb-4">Loading Crys Garage...</div>
          <div className="text-crys-light-grey text-sm">
            If this takes too long, try refreshing the page
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileOptimizations>
      <div className="min-h-screen bg-crys-black dark">
        <Header 
          onNavigate={handleNavigation}
          currentPage={currentPage}
          credits={getCurrentCredits()}
          userTier={tier}
          userData={user ? {
            name: user.name,
            email: user.email,
            tier: tier,
            joinDate: '2025-01-01',
            totalTracks: 0,
            totalSpent: 0,
            isSignedIn: isAuthenticated
          } : undefined}
          onSignOut={handleSignOut}
        />
        
        {/* Auto Authentication Fix */}
        <AutoAuthFix />
        
        {/* Progress Bar for Mastering Workflow */}
        {currentPage.startsWith('mastering-') && (
          <div className="w-full border-b border-crys-graphite bg-crys-black/95">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-crys-white text-sm">
                  {session.file?.name || 'Mastering Workflow'}
                </h3>
                <div className="text-crys-gold text-sm">
                  {(() => {
                    // Get step info based on tier
                    let stepOrder: AppPage[];
                    let currentStep = 1;
                    let totalSteps = 1;
                    
                    switch (tier) {
                      case 'free':
                        stepOrder = ['mastering-genre', 'mastering-config', 'mastering-processing', 'mastering-results'];
                        totalSteps = 4;
                        break;
                      case 'professional':
                        stepOrder = ['mastering-genre', 'mastering-config', 'mastering-processing', 'mastering-results'];
                        totalSteps = 4;
                        break;
                      case 'advanced':
                        stepOrder = ['mastering-genre', 'mastering-controls', 'mastering-results'];
                        totalSteps = 3;
                        break;
                      default:
                        stepOrder = ['mastering-genre', 'mastering-config', 'mastering-processing', 'mastering-results'];
                        totalSteps = 4;
                    }
                    
                    const currentIndex = stepOrder.indexOf(currentPage);
                    currentStep = currentIndex >= 0 ? currentIndex + 1 : 1;
                    
                    return `Step ${currentStep} of ${totalSteps}`;
                  })()}
                </div>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>
          </div>
        )}

        {/* Development Tools - Only visible in development */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="fixed top-20 right-4 z-40 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAPILayer(true)}
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              API Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDesignSystem(true)}
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            >
              <Palette className="w-4 h-4 mr-2" />
              Design System
            </Button>
          </div>
        )}

        {/* Main Content Area - Full Width for Landing Page, Contained for Others */}
        {currentPage === 'home' ? (
          /* Landing Page - Full Width */
          <LandingPage 
            onGetStarted={handleGetStarted}
            onTryMastering={handleTryMastering}
          />
        ) : (
          /* Other Pages - Contained */
          <main className="container mx-auto px-4 py-8">
            {/* Pricing Page - Authentication Required */}
            {currentPage === 'pricing' && isAuthenticated && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                    Choose Your Plan
                  </Badge>
                  <h2 className="text-3xl text-crys-white mb-2">Select Your Mastering Tier</h2>
                  <p className="text-crys-light-grey">
                    Choose the mastering tier that best fits your needs and budget
                  </p>
                </div>
                
                <PricingTiers
                  onTierSelect={handleTierSelect}
                  selectedTier={session.tier}
                />
              </div>
            )}

            {/* Redirect to Auth if trying to access pricing without authentication */}
            {currentPage === 'pricing' && !isAuthenticated && (
              <AuthModal
                initialMode="signin"
                onSignIn={handleSignIn}
                onSignUp={handleSignUp}
                onClose={() => {
                  console.log('Pricing AuthModal closed');
                  // Let the useEffect handle redirection after login
                  // Don't redirect here to avoid race conditions
                }}
              />
            )}

            {/* Courses Page */}
            {currentPage === 'courses' && (
              <CoursesPage 
                onGetStarted={handleGetStarted}
              />
            )}

            {/* Help Page */}
            {currentPage === 'help' && (
              <HelpPage 
                onGetStarted={handleGetStarted}
              />
            )}

            {/* User Profile */}
            {currentPage === 'profile' && isAuthenticated && (
              <UserProfile
                onClose={() => setCurrentPage('home')}
                userData={{
                  name: user?.name || 'User',
                  email: user?.email || '',
                  tier: tier,
                  joinDate: '2025-01-01',
                  totalTracks: 0,
                  totalSpent: 0,
                  isSignedIn: true
                }}
                userCredits={getCurrentCredits()}
                userTier={tier}
                onUpdateUser={() => {}}
              />
            )}

            {/* Auth Modal */}
            {currentPage === 'auth' && (
              <AuthModal
                initialMode={authMode}
                onSignIn={handleSignIn}
                onSignUp={handleSignUp}
                onClose={() => {
                  console.log('Main AuthModal closed');
                  // Let the useEffect handle redirection after login
                  // Don't redirect here to avoid race conditions
                }}
              />
            )}

            {/* Dashboard Pages */}
            {currentPage === 'free-dashboard' && (
              <FreeTierDashboard
                onFileUpload={handleFileUpload}
                onUpgrade={handleUpgrade}
                credits={getCurrentCredits()}
              />
            )}

            {currentPage === 'professional-dashboard' && (
              <ProfessionalTierDashboard
                onFileUpload={handleFileUpload}
                credits={getCurrentCredits()}
              />
            )}

            {currentPage === 'advanced-dashboard' && (
              <AdvancedTierDashboard
                onFileUpload={handleFileUpload}
              />
            )}

            {/* Mastering Workflow Pages */}
            {currentPage === 'mastering-pricing' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                    Step 1 of 5
                  </Badge>
                  <h2 className="text-3xl text-crys-white mb-2">Choose Your Mastering Tier</h2>
                  <p className="text-crys-light-grey">
                    Select the mastering tier that best fits your needs and budget
                  </p>
                </div>
                
                <PricingTiers
                  onTierSelect={handleTierSelect}
                  selectedTier={session.tier}
                />
              </div>
            )}

            {currentPage === 'mastering-genre' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                    {session.tier === 'professional' ? 'Step 1 of 4' : 'Step 1 of 3'}
                  </Badge>
                  <h2 className="text-3xl text-crys-white mb-2">Select Your Genre</h2>
                  <p className="text-crys-light-grey">
                    {session.tier === 'professional' 
                      ? 'Choose the genre that best matches your track for professional mastering'
                      : 'Choose the genre that best matches your track for advanced manual mastering'
                    }
                  </p>
                </div>
                
                <GenreSelection
                  selectedTier={session.tier}
                  onGenreSelect={handleGenreSelect}
                  selectedGenre={session.genre}
                />
              </div>
            )}

            {currentPage === 'mastering-config' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                    Step 2 of 4
                  </Badge>
                  <h2 className="text-3xl text-crys-white mb-2">Quality Configuration</h2>
                  <p className="text-crys-light-grey">
                    Select your preferred quality settings and processing options
                  </p>
                </div>
                
                <ProcessingConfig
                  selectedTier={session.tier}
                  fileName={session.file?.name}
                  onConfigChange={handleConfigChange}
                  onNext={() => {
                    // Route based on tier
                    switch (session.tier) {
                      case 'advanced':
                        setCurrentPage('mastering-controls');
                        break;
                      default:
                        setCurrentPage('mastering-processing');
                    }
                  }}
                />
              </div>
            )}

            {currentPage === 'mastering-processing' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                    {session.tier === 'free' ? 'Step 3 of 4' : session.tier === 'professional' ? 'Step 3 of 4' : 'Step 2 of 3'}
                  </Badge>
                  <h2 className="text-3xl text-crys-white mb-2">
                    {session.tier === 'free' ? 'Automatic Processing' : 'Processing Your Track'}
                  </h2>
                  <p className="text-crys-light-grey">
                    {session.tier === 'free' 
                      ? 'Our AI is automatically mastering your track with optimized settings'
                      : 'Our AI is analyzing and mastering your audio with your selected settings'
                    }
                  </p>
                </div>
                
                <div className="space-y-6">
                  <SignalFlow 
                    isProcessing={isProcessing}
                    fileName={session.file?.name}
                  />
                  
                  {!isProcessing && (
                    <div className="text-center">
                      <Button 
                        onClick={() => {
                          setIsProcessing(true);
                          simulateProcessing();
                        }}
                        className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8"
                      >
                        Start Processing
                      </Button>
                    </div>
                  )}
                  
                  {isProcessing && (
                    <div className="bg-crys-charcoal rounded-lg p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-crys-light-grey">Progress</span>
                          <span className="text-crys-gold">{processingProgress}%</span>
                        </div>
                        <Progress value={processingProgress} className="h-2" />
                      </div>
                    </div>
                  )}
                  
                  {/* Back to Home button for stuck users */}
                  <div className="text-center mt-6">
                    <Button 
                      onClick={() => setCurrentPage('home')}
                      variant="outline"
                      className="border-crys-graphite text-crys-light-grey hover:bg-crys-graphite/20"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'mastering-controls' && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                    Step 1 of 3 - Advanced Manual Mastering
                  </Badge>
                  <h2 className="text-3xl text-crys-white mb-2">Professional Mastering Controls</h2>
                  <p className="text-crys-light-grey">
                    Fine-tune every aspect of your master with real-time preview and professional-grade tools
                  </p>
                </div>
                
                <div className="space-y-6">
                  <SignalFlow 
                    isProcessing={false}
                    fileName={session.file?.name}
                  />
                  
                  <MasteringControls 
                    isAdvancedTier={true}
                    onParameterChange={(module, param, value) => {
                      console.log(`${module}.${param} = ${value}`);
                    }}
                  />
                </div>
                
                <div className="text-center mt-8">
                  <Button 
                    onClick={completeAdvancedMastering}
                    className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8"
                  >
                    Complete Mastering
                  </Button>
                </div>
              </div>
            )}

            {currentPage === 'mastering-results' && session.file && (
              <MasteringResults
                audioId={session.audioId || ''}
                fileName={session.file.name}
                selectedTier={session.tier || tier}
                selectedGenre={session.genre}
                processingConfig={session.config}
                canDownload={tier !== 'free'} // Only pro and advanced can download
                onDownload={handleDownload}
                onStartNewMaster={resetWorkflow}
                originalFile={session.file}
                masteredResult={session.masteredResult}
              />
            )}
          </main>
        )}
        
        {/* Footer - Full Width */}
        <footer className="w-full border-t border-crys-graphite bg-crys-black/95 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-crys-light-grey text-sm">
              <p className="mb-2">© 2025 Crys Garage Studio - Professional Audio Mastering Platform</p>
              <p className="text-crys-gold">"Craft the sound, Unleash the future"</p>
            </div>
          </div>
        </footer>

        {/* Development Tools Modals */}
        {showAPILayer && (
          <APIIntegrationLayer
            isVisible={showAPILayer}
            onClose={() => setShowAPILayer(false)}
          />
        )}

        {showDesignSystem && (
          <AfrocentricDesignSystem
            isVisible={showDesignSystem}
            onClose={() => setShowDesignSystem(false)}
          />
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            console.log('❌ Payment modal closed without completion');
            setShowPaymentModal(false);
            setSelectedTierForPayment('');
            // Reset session tier to empty if payment was canceled
            setSession(prev => ({
              ...prev,
              tier: ''
            }));
          }}
          selectedTier={selectedTierForPayment}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </MobileOptimizations>
  );
}

// Wrapper component that provides the context
export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  );
}