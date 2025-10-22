import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebaseAuthService, { User } from '../services/firebaseAuth';
import { emailNotificationService } from '../services/emailNotificationService';

interface AuthenticationContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (name: string, email: string, password: string, tier?: 'free' | 'pro' | 'advanced') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (tier?: 'free' | 'pro' | 'advanced') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  pendingTierAccess: string | null;
  setPendingTierAccess: (tier: string | null) => void;
  showPaymentModal: () => void;
  hidePaymentModal: () => void;
  paymentDetails: any;
  setPaymentDetails: (details: any) => void;
}

const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

interface AuthenticationProviderProps {
  children: ReactNode;
}

export function AuthenticationProvider({ children }: AuthenticationProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTierAccess, setPendingTierAccess] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Force re-render when user state changes
  const [authVersion, setAuthVersion] = useState(0);

  // Initialize authentication state
  useEffect(() => {
    console.log('AuthenticationContext: Starting Firebase initialization...');
    
    // Set a timeout to stop loading after 3 seconds if Firebase doesn't respond
    const timeoutId = setTimeout(() => {
      console.log('AuthenticationContext: Firebase initialization timeout, checking localStorage');
      // Fallback to localStorage if Firebase doesn't respond
      const storedUser = localStorage.getItem('user') || localStorage.getItem('crysgarage_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('AuthenticationContext: Loaded user from localStorage:', userData);
        } catch (error) {
          console.error('AuthenticationContext: Failed to parse stored user data:', error);
        }
      }
      setIsLoading(false);
    }, 3000);
    
    try {
      const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
        console.log('AuthenticationContext: Firebase auth state changed:', user ? 'User signed in' : 'User signed out');
        
        clearTimeout(timeoutId); // Clear timeout since we got a response
        setUser(user);
        setIsLoading(false); // Set loading to false when auth state is determined
        setAuthVersion(prev => prev + 1); // Force re-render
        
        if (user) {
          console.log('AuthenticationContext: User authenticated:', user);
        } else {
          console.log('AuthenticationContext: User not authenticated');
        }
      });

      return () => {
        console.log('AuthenticationContext: Cleaning up Firebase auth listener');
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      console.error('AuthenticationContext: Firebase initialization error:', error);
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  const signup = async (name: string, email: string, password: string, tier: 'free' | 'pro' | 'advanced' = 'free') => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('AuthenticationContext: Starting Firebase signup for:', email, 'with tier:', tier);
      const user = await firebaseAuthService.signUpWithEmail(email, password, name, tier);
      console.log('AuthenticationContext: Firebase signup successful, new user:', user);
      setUser(user);
      setAuthVersion(prev => prev + 1); // Force re-render
      console.log('AuthenticationContext: User state set to:', user);
      
      // Send welcome email
      try {
        await emailNotificationService.sendWelcomeEmail({
          userEmail: user.email,
          userName: user.name,
          userTier: user.tier
        });
        console.log('AuthenticationContext: Welcome email sent successfully');
      } catch (emailError) {
        console.error('AuthenticationContext: Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }
    } catch (error: any) {
      console.error('AuthenticationContext: Firebase signup failed:', error);
      setError(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('AuthenticationContext: Starting Firebase login for:', email);
      const user = await firebaseAuthService.signInWithEmail(email, password);
      console.log('AuthenticationContext: Firebase login successful:', user);
      setUser(user);
      setAuthVersion(prev => prev + 1); // Force re-render
      
      // Send login notification email
      try {
        const userIP = await emailNotificationService.getUserIP();
        await emailNotificationService.sendLoginNotification({
          userEmail: user.email,
          userName: user.name,
          loginTime: new Date().toISOString(),
          ipAddress: userIP
        });
        console.log('AuthenticationContext: Login notification email sent successfully');
      } catch (emailError) {
        console.error('AuthenticationContext: Failed to send login notification email:', emailError);
        // Don't fail the login if email fails
      }
    } catch (error: any) {
      console.error('AuthenticationContext: Firebase login failed:', error);
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (tier: 'free' | 'pro' | 'advanced' = 'free') => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('AuthenticationContext: Starting Firebase Google sign in...');
      const user = await firebaseAuthService.signInWithGoogle(tier);
      console.log('AuthenticationContext: Firebase Google sign in successful:', user);
      setUser(user);
      setAuthVersion(prev => prev + 1); // Force re-render
      
      // Send login notification email
      try {
        const userIP = await emailNotificationService.getUserIP();
        await emailNotificationService.sendLoginNotification({
          userEmail: user.email,
          userName: user.name,
          loginTime: new Date().toISOString(),
          ipAddress: userIP
        });
        console.log('AuthenticationContext: Login notification email sent successfully');
      } catch (emailError) {
        console.error('AuthenticationContext: Failed to send login notification email:', emailError);
        // Don't fail the login if email fails
      }
    } catch (error: any) {
      console.error('AuthenticationContext: Firebase Google sign in failed:', error);
      setError(error.message || 'Google sign in failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('AuthenticationContext: Starting Firebase logout...');
      await firebaseAuthService.signOut();
      console.log('AuthenticationContext: Firebase logout successful');
      setUser(null);
    } catch (error) {
      console.error('AuthenticationContext: Firebase logout error:', error);
      // Clear local state even if server logout fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('AuthenticationContext: Starting Firebase profile update...');
      const updatedUser = await firebaseAuthService.updateProfile(profileData);
      console.log('AuthenticationContext: Firebase profile update successful:', updatedUser);
      setUser(updatedUser);
      
      // Update multiple localStorage keys to ensure persistence
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('crysgarage_user', JSON.stringify(updatedUser));
      localStorage.setItem('crysgarage_firebase_user', JSON.stringify(updatedUser));
      
      // Force re-render to update UI
      setAuthVersion(prev => prev + 1);
      
      console.log('AuthenticationContext: Profile data persisted to localStorage');
    } catch (error: any) {
      console.error('AuthenticationContext: Firebase profile update failed:', error);
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('AuthenticationContext: Starting Firebase user refresh...');
      const refreshedUser = await firebaseAuthService.refreshUser();
      if (refreshedUser) {
        console.log('AuthenticationContext: Firebase user refresh successful:', refreshedUser);
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('AuthenticationContext: Firebase user refresh failed:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const showAuthModalFn = () => {
    setShowAuthModal(true);
  };

  const hideAuthModalFn = () => {
    setShowAuthModal(false);
  };

  const showPaymentModalFn = () => {
    setShowPaymentModal(true);
  };

  const hidePaymentModalFn = () => {
    setShowPaymentModal(false);
  };

  const value: AuthenticationContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signup,
    login,
    signInWithGoogle,
    logout,
    updateProfile,
    refreshUser,
    clearError,
    showAuthModal: showAuthModalFn,
    hideAuthModal: hideAuthModalFn,
    pendingTierAccess,
    setPendingTierAccess,
    showPaymentModal: showPaymentModalFn,
    hidePaymentModal: hidePaymentModalFn,
    paymentDetails,
    setPaymentDetails,
  };

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthenticationContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
}
