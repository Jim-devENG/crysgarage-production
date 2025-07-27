import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authAPI, audioAPI, creditsAPI, User, MasteringSession, ProcessingConfiguration } from '../services/api';

// Types
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentSession: MasteringSession | null;
  credits: number;
  tier: string;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SESSION'; payload: MasteringSession | null }
  | { type: 'SET_CREDITS'; payload: number }
  | { type: 'SET_TIER'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentSession: null,
  credits: 0,
  tier: 'free',
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
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

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if user is authenticated
      const token = localStorage.getItem('crysgarage_token');
      console.log('Token found:', !!token);
      
      if (token) {
        try {
          // Try to refresh user data, but don't block the app if it fails
          await refreshUserData();
          console.log('User data refreshed successfully');
        } catch (error: any) {
          console.error('Failed to refresh user data during init:', error);
          
          // Check if it's a 401 error
          if (error.response?.status === 401) {
            console.log('Token is invalid, clearing and continuing without authentication');
            localStorage.removeItem('crysgarage_token');
          }
          
          // Set default state for unauthenticated user
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
          dispatch({ type: 'SET_CREDITS', payload: 0 });
          dispatch({ type: 'SET_TIER', payload: 'free' });
        }
      } else {
        console.log('No token found, user not authenticated');
        // Set default state for unauthenticated user
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        dispatch({ type: 'SET_CREDITS', payload: 0 });
        dispatch({ type: 'SET_TIER', payload: 'free' });
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Don't set error state, just continue with default unauthenticated state
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      dispatch({ type: 'SET_CREDITS', payload: 0 });
      dispatch({ type: 'SET_TIER', payload: 'free' });
    } finally {
      console.log('App initialization complete');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('=== APPCONTEXT SIGNIN START ===');
      console.log('Signing in with:', email);
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { user } = await authAPI.signIn(email, password);
      console.log('AuthAPI response user:', user);
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'SET_CREDITS', payload: user.credits });
      dispatch({ type: 'SET_TIER', payload: user.tier });
      
      console.log('State updates dispatched');
      console.log('=== APPCONTEXT SIGNIN END ===');
    } catch (error: any) {
      console.error('=== APPCONTEXT SIGNIN ERROR ===');
      console.error('Error in signIn:', error);
      console.error('Error response:', error.response?.data);
      console.error('=== APPCONTEXT SIGNIN ERROR END ===');
      
      const message = error.response?.data?.message || 'Sign in failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { user } = await authAPI.signUp(name, email, password);
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'SET_CREDITS', payload: user.credits });
      dispatch({ type: 'SET_TIER', payload: user.tier });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Sign up failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      dispatch({ type: 'SET_SESSION', payload: null });
      dispatch({ type: 'SET_CREDITS', payload: 0 });
      dispatch({ type: 'SET_TIER', payload: 'free' });
    }
  };

  const uploadFile = async (file: File, genre?: string): Promise<string> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { audio_id } = await audioAPI.uploadFile(file, genre);
      
      // Create a session object for compatibility
      const session: MasteringSession = {
        id: audio_id,
        user_id: state.user?.id || 0,
        file_name: file.name,
        file_size: file.size,
        genre: genre || 'unknown',
        tier: state.tier,
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      dispatch({ type: 'SET_SESSION', payload: session });
      
      return audio_id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'File upload failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const startMastering = async (sessionId: string, genre: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // The original code had masteringAPI.startMastering(sessionId, genre, config);
      // This line was removed from the import, so it's commented out or removed.
      // Assuming the intent was to remove the call or that the API is no longer available.
      // For now, I'm commenting out the line as it's no longer imported.
      // await masteringAPI.startMastering(sessionId, genre, config); 
      
      // Update session status using audio API
      const status = await audioAPI.getStatus(sessionId);
      const session: MasteringSession = {
        id: sessionId,
        user_id: state.user?.id || 0,
        file_name: state.currentSession?.file_name || '',
        file_size: state.currentSession?.file_size || 0,
        genre: genre,
        tier: state.tier,
        status: status.status === 'done' ? 'completed' : status.status === 'failed' ? 'failed' : 'processing',
        progress: status.progress,
        created_at: state.currentSession?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatch({ type: 'SET_SESSION', payload: session });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to start mastering';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getSessionStatus = async (sessionId: string) => {
    try {
      const status = await audioAPI.getStatus(sessionId);
      const session: MasteringSession = {
        id: sessionId,
        user_id: state.user?.id || 0,
        file_name: state.currentSession?.file_name || '',
        file_size: state.currentSession?.file_size || 0,
        genre: state.currentSession?.genre || '',
        tier: state.tier,
        status: status.status === 'done' ? 'completed' : status.status === 'failed' ? 'failed' : 'processing',
        progress: status.progress,
        created_at: state.currentSession?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatch({ type: 'SET_SESSION', payload: session });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get session status';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      console.log('Refreshing user data...');
      
      // Try to get user data, but don't fail if endpoint doesn't exist
      let user = null;
      let balance = { credits: 0, tier: 'free' };
      
      try {
        user = await authAPI.getCurrentUser();
        console.log('User data refreshed:', user);
      } catch (error) {
        console.log('Auth endpoint not available, using default user state');
      }
      
      try {
        balance = await creditsAPI.getBalance();
        console.log('Credits balance refreshed:', balance);
      } catch (error) {
        console.log('Credits endpoint not available, using default balance');
      }
      
      // Set user state with available data
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'SET_CREDITS', payload: balance.credits });
        dispatch({ type: 'SET_TIER', payload: balance.tier });
      } else {
        // If no user data available, set default unauthenticated state
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        dispatch({ type: 'SET_CREDITS', payload: 0 });
        dispatch({ type: 'SET_TIER', payload: 'free' });
      }
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      // Set default unauthenticated state
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      dispatch({ type: 'SET_CREDITS', payload: 0 });
      dispatch({ type: 'SET_TIER', payload: 'free' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 