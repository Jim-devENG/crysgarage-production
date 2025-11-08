import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import firebaseAuthService, { User } from '../services/firebaseAuth';

interface FirebaseAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  // Modal states
  showAuthModal: boolean;
  hideAuthModal: () => void;
  pendingTierAccess: string | null;
  setPendingTierAccess: (tier: string | null) => void;
  showPaymentModal: boolean;
  hidePaymentModal: () => void;
  paymentDetails: any;
  setPaymentDetails: (details: any) => void;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authVersion, setAuthVersion] = useState(0);

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingTierAccess, setPendingTierAccess] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Initialize authentication
  useEffect(() => {
    console.log('FirebaseAuthContext: Starting initialization...');
    
    const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
      console.log('FirebaseAuthContext: Auth state changed:', user ? 'User signed in' : 'User signed out');
      
      setUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false);
      setAuthVersion(prev => prev + 1); // Force re-render
      
      if (user) {
        console.log('FirebaseAuthContext: User authenticated:', user);
      } else {
        console.log('FirebaseAuthContext: User not authenticated');
      }
    });

    return () => {
      console.log('FirebaseAuthContext: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('FirebaseAuthContext: Starting Google sign in...');
      
      const user = await firebaseAuthService.signInWithGoogle();
      console.log('FirebaseAuthContext: Google sign in successful:', user);
      
      setUser(user);
      setIsAuthenticated(true);
      setAuthVersion(prev => prev + 1);
    } catch (error: any) {
      console.error('FirebaseAuthContext: Google sign in failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('FirebaseAuthContext: Starting email sign in...');
      
      const user = await firebaseAuthService.signInWithEmail(email, password);
      console.log('FirebaseAuthContext: Email sign in successful:', user);
      
      setUser(user);
      setIsAuthenticated(true);
      setAuthVersion(prev => prev + 1);
    } catch (error: any) {
      console.error('FirebaseAuthContext: Email sign in failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('FirebaseAuthContext: Starting email sign up...');
      
      const user = await firebaseAuthService.signUpWithEmail(email, password, name);
      console.log('FirebaseAuthContext: Email sign up successful:', user);
      
      setUser(user);
      setIsAuthenticated(true);
      setAuthVersion(prev => prev + 1);
    } catch (error: any) {
      console.error('FirebaseAuthContext: Email sign up failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('FirebaseAuthContext: Starting sign out...');
      
      await firebaseAuthService.signOut();
      console.log('FirebaseAuthContext: Sign out successful');
      
      setUser(null);
      setIsAuthenticated(false);
      setAuthVersion(prev => prev + 1);
    } catch (error: any) {
      console.error('FirebaseAuthContext: Sign out failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setError(null);
      console.log('FirebaseAuthContext: Updating profile...');
      
      const updatedUser = await firebaseAuthService.updateProfile(updates);
      console.log('FirebaseAuthContext: Profile updated:', updatedUser);
      
      setUser(updatedUser);
      setAuthVersion(prev => prev + 1);
    } catch (error: any) {
      console.error('FirebaseAuthContext: Profile update failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      console.log('FirebaseAuthContext: Refreshing user...');
      
      const refreshedUser = await firebaseAuthService.refreshUser();
      if (refreshedUser) {
        setUser(refreshedUser);
        setAuthVersion(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('FirebaseAuthContext: User refresh failed:', error);
      setError(error.message);
    }
  };

  const hideAuthModal = () => {
    setShowAuthModal(false);
    setPendingTierAccess(null);
  };

  const hidePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentDetails(null);
  };

  const value: FirebaseAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    refreshUser,
    showAuthModal,
    hideAuthModal,
    pendingTierAccess,
    setPendingTierAccess,
    showPaymentModal,
    hidePaymentModal,
    paymentDetails,
    setPaymentDetails,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = (): FirebaseAuthContextType => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

