import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

// User interface that matches your existing system
export interface User {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'advanced';
  credits: number;
  join_date: string;
  total_tracks: number;
  total_spent: number;
  profile_picture?: string;
  // Additional profile fields
  phone?: string;
  company?: string;
  location?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  kyc_verified?: boolean;
}

// Convert Firebase user to your User interface
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    tier: 'free', // Default tier
    credits: 0, // Default credits
    join_date: new Date().toISOString(),
    total_tracks: 0,
    total_spent: 0,
    profile_picture: firebaseUser.photoURL || undefined
  };
};

// Token manager for localStorage
const tokenManager = {
  getToken: (): string | null => {
    const token = localStorage.getItem('crysgarage_firebase_token');
    console.log('tokenManager.getToken():', token ? 'Token found' : 'No token');
    return token;
  },
  
  setToken: (token: string): void => {
    console.log('tokenManager.setToken(): Setting token');
    localStorage.setItem('crysgarage_firebase_token', token);
  },
  
  removeToken: (): void => {
    console.log('tokenManager.removeToken(): Removing token');
    localStorage.removeItem('crysgarage_firebase_token');
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem('crysgarage_firebase_user');
    console.log('tokenManager.getUser(): Raw user string =', userStr);
    
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      console.log('tokenManager.getUser(): No valid user data found');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('tokenManager.getUser(): Parsed user =', user);
      return user;
    } catch (error) {
      console.error('tokenManager.getUser(): Failed to parse user data:', error);
      return null;
    }
  },
  
  setUser: (user: User): void => {
    console.log('tokenManager.setUser(): Setting user =', user);
    localStorage.setItem('crysgarage_firebase_user', JSON.stringify(user));
  },
  
  removeUser: (): void => {
    console.log('tokenManager.removeUser(): Removing user');
    localStorage.removeItem('crysgarage_firebase_user');
  },
  
  clearAuth: (): void => {
    console.log('tokenManager.clearAuth(): Clearing all auth data');
    tokenManager.removeToken();
    tokenManager.removeUser();
  }
};

class FirebaseAuthService {
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Check for redirect result first
    this.handleRedirectResult();
    
    // Listen to Firebase auth state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        // User is signed in
        const user = convertFirebaseUser(firebaseUser);
        
        // Get Firebase ID token
        const token = await firebaseUser.getIdToken();
        
        // Store in localStorage
        tokenManager.setToken(token);
        tokenManager.setUser(user);
        
        // Notify listeners
        this.authStateListeners.forEach(listener => listener(user));
      } else {
        // User is signed out
        tokenManager.clearAuth();
        
        // Notify listeners
        this.authStateListeners.forEach(listener => listener(null));
      }
    });
  }

  // Handle redirect result from Google sign-in
  private async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('FirebaseAuth: Redirect result received:', result.user);
        // The auth state change listener will handle the rest
      }
    } catch (error) {
      console.log('FirebaseAuth: No redirect result or error:', error);
    }
  }

  // Add auth state listener
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      console.log('FirebaseAuth: Starting Google sign in...');
      
      // Try popup first, fallback to redirect if blocked
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = convertFirebaseUser(result.user);
        console.log('FirebaseAuth: Google sign in successful (popup):', user);
        return user;
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          console.log('FirebaseAuth: Popup blocked, using redirect...');
          // Use the current origin for redirect
          const redirectUrl = window.location.origin;
          console.log('FirebaseAuth: Redirecting to:', redirectUrl);
          await signInWithRedirect(auth, googleProvider);
          // The redirect will handle the sign-in, so we return a promise that resolves when the page reloads
          return new Promise((resolve, reject) => {
            // This will be handled by the redirect result in the auth state change listener
            setTimeout(() => {
              reject(new Error('Redirect initiated - page will reload'));
            }, 1000);
          });
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('FirebaseAuth: Google sign in failed:', error);
      throw new Error(`Google sign in failed: ${error.message}`);
    }
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      console.log('FirebaseAuth: Starting email sign in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = convertFirebaseUser(result.user);
      
      console.log('FirebaseAuth: Email sign in successful:', user);
      return user;
    } catch (error: any) {
      console.error('FirebaseAuth: Email sign in failed:', error);
      throw new Error(`Email sign in failed: ${error.message}`);
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      console.log('FirebaseAuth: Starting email sign up...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(result.user, { displayName: name });
      
      const user = convertFirebaseUser(result.user);
      
      console.log('FirebaseAuth: Email sign up successful:', user);
      return user;
    } catch (error: any) {
      console.error('FirebaseAuth: Email sign up failed:', error);
      throw new Error(`Email sign up failed: ${error.message}`);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      console.log('FirebaseAuth: Starting sign out...');
      await signOut(auth);
      console.log('FirebaseAuth: Sign out successful');
    } catch (error: any) {
      console.error('FirebaseAuth: Sign out failed:', error);
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const user = tokenManager.getUser();
    console.log('FirebaseAuth: getCurrentUser() =', user);
    return user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = tokenManager.getToken();
    const user = tokenManager.getUser();
    const isAuth = !!(token && user);
    console.log('FirebaseAuth: isAuthenticated() =', isAuth);
    return isAuth;
  }

  // Refresh user data (get fresh token)
  async refreshUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('FirebaseAuth: No current user to refresh');
      return null;
    }

    try {
      console.log('FirebaseAuth: Refreshing user data...');
      const token = await currentUser.getIdToken(true); // Force refresh
      const user = convertFirebaseUser(currentUser);
      
      tokenManager.setToken(token);
      tokenManager.setUser(user);
      
      console.log('FirebaseAuth: User data refreshed:', user);
      return user;
    } catch (error: any) {
      console.error('FirebaseAuth: Failed to refresh user data:', error);
      throw new Error(`Failed to refresh user data: ${error.message}`);
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      console.log('FirebaseAuth: Updating profile...');
      
      // Update Firebase profile if needed
      if (updates.name) {
        await updateProfile(currentUser, { displayName: updates.name });
      }

      // Get updated user data
      const user = convertFirebaseUser(currentUser);
      const updatedUser = { ...user, ...updates };
      
      // Store updated user data
      tokenManager.setUser(updatedUser);
      
      console.log('FirebaseAuth: Profile updated:', updatedUser);
      return updatedUser;
    } catch (error: any) {
      console.error('FirebaseAuth: Profile update failed:', error);
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
