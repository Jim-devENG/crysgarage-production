import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authAPI, audioAPI, creditsAPI, User, MasteringSession, ProcessingConfiguration } from '../services/api';
import authService, { LoginCredentials, SignupCredentials, tokenManager } from '../services/authentication';

// Types
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentSession: MasteringSession | null;
  credits: number;
  tier: string;
  error: string | null;
  isSyncing: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SESSION'; payload: MasteringSession | null }
  | { type: 'SET_CREDITS'; payload: number }
  | { type: 'SET_TIER'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SYNCING'; payload: boolean };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentSession: null,
  credits: 0,
  tier: 'free',
  error: null,
  isSyncing: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        tier: action.payload?.tier || 'free',
        credits: action.payload?.credits || 0
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_SESSION':
      return { ...state, currentSession: action.payload };
    case 'SET_CREDITS':
      return { ...state, credits: action.payload };
    case 'SET_TIER':
      return { ...state, tier: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };
    default:
      return state;
  }
}

// Context
interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  startMastering: (sessionId: string, genre: string, config: ProcessingConfiguration) => Promise<void>;
  getSessionStatus: (sessionId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app on mount
  useEffect(() => {
    const initTimeout = setTimeout(() => {
      console.log('App initialization timeout - forcing loading to false');
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 3000); // 3 second timeout

    initializeApp().finally(() => {
      clearTimeout(initTimeout);
    });

    return () => clearTimeout(initTimeout);
  }, []);

  // Additional effect to ensure authentication state is always in sync with localStorage
  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('crysgarage_token');
      const storedUser = localStorage.getItem('crysgarage_user');
      
      // Check for invalid stored data (like "undefined" string)
      if (storedUser === 'undefined' || storedUser === 'null' || storedUser === null) {
        localStorage.removeItem('crysgarage_user');
        localStorage.removeItem('crysgarage_token');
        return;
      }
      
      if (token && storedUser && !state.user) {
        try {
          const user = JSON.parse(storedUser);
          console.log('Found stored user data, updating state:', user);
          dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('crysgarage_token');
          localStorage.removeItem('crysgarage_user');
        }
      } else if (!token && !storedUser && state.user) {
        console.log('No stored auth data but user in state, clearing state');
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    // Check immediately
    checkAuthState();

    // Set up interval to check periodically (reduced frequency to avoid conflicts)
    const interval = setInterval(checkAuthState, 5000);

    return () => clearInterval(interval);
  }, [state.user]);

  // Background sync for real-time user data updates
  useEffect(() => {
    if (!state.user || !state.isAuthenticated) return;

    const syncUserData = async () => {
      try {
        dispatch({ type: 'SET_SYNCING', payload: true });
        console.log('Background sync: Fetching latest user data...');
        const refreshedUser = await authService.refreshUser();
        if (refreshedUser) {
          // Only update if there are actual changes to avoid unnecessary re-renders
          const hasChanges = JSON.stringify(refreshedUser) !== JSON.stringify(state.user);
          if (hasChanges) {
            console.log('Background sync: User data updated', refreshedUser);
            dispatch({ type: 'SET_USER', payload: refreshedUser });
          }
        }
      } catch (error) {
        console.error('Background sync failed:', error);
        // Don't show error to user for background sync failures
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    };

    // Sync every 30 seconds when user is authenticated
    const syncInterval = setInterval(syncUserData, 30000);

    return () => clearInterval(syncInterval);
  }, [state.user, state.isAuthenticated]);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      dispatch({ type: 'SET_LOADING', payload: true });

      // Check if user is already authenticated using the new auth service
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user) {
          console.log('User found in storage:', user);
          dispatch({ type: 'SET_USER', payload: user });
          
          // Try to refresh user data from server
          try {
            const refreshedUser = await authService.refreshUser();
            if (refreshedUser) {
              dispatch({ type: 'SET_USER', payload: refreshedUser });
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
            // Keep existing user data if refresh fails
          }
        } else {
          // Clear invalid auth data
          authService.logout();
        }
      } else {
        // Try legacy auth check
        const token = localStorage.getItem('crysgarage_token');
        const storedUser = localStorage.getItem('crysgarage_user');
        
        // Check for invalid stored data (like "undefined" string)
        if (storedUser === 'undefined' || storedUser === 'null' || storedUser === null) {
          localStorage.removeItem('crysgarage_user');
          localStorage.removeItem('crysgarage_token');
        } else if (token && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('Legacy user found:', user);
            dispatch({ type: 'SET_USER', payload: user });
            
            // Migrate to new auth service
                  tokenManager.setToken(token);
      tokenManager.setUser(user);
          } catch (error) {
            console.error('Failed to parse legacy user data:', error);
            // Clear invalid data
            localStorage.removeItem('crysgarage_token');
            localStorage.removeItem('crysgarage_user');
          }
        }
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('App initialization failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Updated sign in function using new auth service
  const signIn = async (email: string, password: string) => {
    try {
      console.log('=== APPCONTEXT SIGNIN START ===');
      console.log('Signing in with:', email);
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { user } = await authService.login({ email, password });
      console.log('AuthService response user:', user);
      
      dispatch({ type: 'SET_USER', payload: user });
      
      console.log('State updates dispatched');
      console.log('=== APPCONTEXT SIGNIN END ===');
    } catch (error: any) {
      console.error('=== APPCONTEXT SIGNIN ERROR ===');
      console.error('Error in signIn:', error);
      console.error('=== APPCONTEXT SIGNIN ERROR END ===');
      
      const message = error.message || 'Sign in failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Updated sign up function using new auth service
  const signUp = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { user } = await authService.signup({ name, email, password });
      
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      const message = error.message || 'Sign up failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Updated sign out function using new auth service
  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.logout();
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if logout fails, clear local state
      dispatch({ type: 'SET_USER', payload: null });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Keep all existing functionality
  const uploadFile = async (file: File): Promise<string> => {
    try {
      const response = await audioAPI.uploadFile(file);
      return response.audio_id || 'uploaded_file';
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };

  const startMastering = async (sessionId: string, genre: string, config: ProcessingConfiguration): Promise<void> => {
    try {
      const response = await audioAPI.startMastering(sessionId, { genre, config });
      // Create a mock session object since the API doesn't return a full session
      const mockSession: MasteringSession = {
        id: response.session_id || sessionId,
        user_id: state.user?.id || 0,
        file_name: 'audio_file.wav',
        file_size: 0,
        status: 'processing',
        genre: genre,
        tier: state.user?.tier || 'free',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dispatch({ type: 'SET_SESSION', payload: mockSession });
    } catch (error) {
      console.error('Start mastering failed:', error);
      throw error;
    }
  };

  const getSessionStatus = async (sessionId: string): Promise<void> => {
    try {
      // Since getSessionStatus doesn't exist, we'll create a mock session
      const mockSession: MasteringSession = {
        id: sessionId,
        user_id: state.user?.id || 0,
        file_name: 'audio_file.wav',
        file_size: 0,
        status: 'processing',
        genre: 'afrobeats',
        tier: state.user?.tier || 'free',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dispatch({ type: 'SET_SESSION', payload: mockSession });
    } catch (error) {
      console.error('Get session status failed:', error);
      throw error;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      const user = await authService.refreshUser();
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error) {
      console.error('Refresh user data failed:', error);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const value: AppContextType = {
    ...state,
    dispatch,
    signIn,
    signUp,
    signOut,
    uploadFile,
    startMastering,
    getSessionStatus,
    refreshUserData,
    clearError,
    updateUser,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext; 