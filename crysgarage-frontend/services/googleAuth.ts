// Google Authentication Service
// This service handles Google OAuth authentication for login and signup

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface GoogleAuthResponse {
  user: GoogleUser;
  token: string;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized: boolean = false;

  constructor() {
    // In a real app, this would come from environment variables
    // Use import.meta.env for Vite or window.__ENV__ for other setups
    this.clientId = (import.meta?.env?.REACT_APP_GOOGLE_CLIENT_ID as string) || 
                   (window as any).__ENV__?.REACT_APP_GOOGLE_CLIENT_ID || 
                   'your-google-client-id';
  }

  // Initialize Google OAuth
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google OAuth script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isInitialized = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google OAuth script'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<GoogleAuthResponse> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (typeof window.google === 'undefined') {
        reject(new Error('Google OAuth not loaded'));
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'openid email profile',
        callback: async (response: any) => {
          try {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            // Get user info using the access token
            const userInfo = await this.getUserInfo(response.access_token);
            
            // In a real app, you would send this to your backend
            // to create/authenticate the user
            const authResponse: GoogleAuthResponse = {
              user: userInfo,
              token: response.access_token
            };

            resolve(authResponse);
          } catch (error) {
            reject(error);
          }
        }
      });

      client.requestAccessToken();
    });
  }

  // Get user information from Google
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const data = await response.json();
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture
    };
  }

  // Sign out (revoke token)
  async signOut(accessToken?: string): Promise<void> {
    if (accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
          method: 'POST'
        });
      } catch (error) {
        console.warn('Failed to revoke Google token:', error);
      }
    }

    // Clear any stored tokens
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user');
  }

  // Check if user is signed in with Google
  isSignedIn(): boolean {
    return !!localStorage.getItem('google_access_token');
  }

  // Get stored user info
  getStoredUser(): GoogleUser | null {
    const userStr = localStorage.getItem('google_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Store user info locally
  storeUser(user: GoogleUser, token: string): void {
    localStorage.setItem('google_user', JSON.stringify(user));
    localStorage.setItem('google_access_token', token);
  }
}

// Mock implementation for development (when Google OAuth is not configured)
class MockGoogleAuthService extends GoogleAuthService {
  async signInWithGoogle(): Promise<GoogleAuthResponse> {
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: GoogleUser = {
      id: 'mock-google-id-' + Date.now(),
      name: 'Mock Google User',
      email: 'mockuser@gmail.com',
      picture: 'https://via.placeholder.com/150'
    };

    const mockToken = 'mock-google-token-' + Date.now();

    this.storeUser(mockUser, mockToken);

    return {
      user: mockUser,
      token: mockToken
    };
  }

  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user');
  }
}

// Export the appropriate service based on environment
const googleAuthService = new MockGoogleAuthService(); // Always use mock for now

export default googleAuthService;

// Type declarations for Google OAuth
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}
