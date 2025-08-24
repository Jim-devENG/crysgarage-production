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
    // Get client ID from environment variables
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                   (window as any).__ENV__?.REACT_APP_GOOGLE_CLIENT_ID || 
                   'your-google-client-id';
  }

  // Check if Google OAuth is properly configured
  private isProperlyConfigured(): boolean {
    return this.clientId && 
           this.clientId !== 'your-google-client-id' && 
           this.clientId !== 'your-google-client-id-here';
  }

  // Initialize Google OAuth
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if Google OAuth is configured
    if (!this.isProperlyConfigured()) {
      throw new Error(
        'Google OAuth is not configured. Please contact support to enable Google login.'
      );
    }

    return new Promise((resolve, reject) => {
      // Check if Google script is already loaded
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        this.isInitialized = true;
        resolve();
        return;
      }

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
        reject(new Error('Failed to load Google OAuth script. Please check your internet connection.'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Sign in with Google using Google Identity Services
  async signInWithGoogle(): Promise<GoogleAuthResponse> {
    try {
      // Check configuration first
      if (!this.isProperlyConfigured()) {
        throw new Error(
          'Google OAuth is not configured for this application. Please use email/password login or contact support.'
        );
      }

      await this.initialize();

      return new Promise((resolve, reject) => {
        if (typeof window.google === 'undefined' || !window.google.accounts) {
          reject(new Error('Google OAuth not loaded. Please refresh the page and try again.'));
          return;
        }

        // Use Google Identity Services for better compatibility
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: async (response: any) => {
            try {
              if (response.error) {
                console.error('Google OAuth error:', response.error);
                
                // Provide user-friendly error messages
                let errorMessage = 'Google authentication failed.';
                if (response.error === 'popup_closed_by_user') {
                  errorMessage = 'Google login was cancelled. Please try again.';
                } else if (response.error === 'access_denied') {
                  errorMessage = 'Access denied. Please allow access to your Google account.';
                } else if (response.error === 'invalid_client') {
                  errorMessage = 'Google OAuth is not properly configured. Please contact support.';
                }
                
                reject(new Error(errorMessage));
                return;
              }

              if (!response.access_token) {
                reject(new Error('No access token received from Google. Please try again.'));
                return;
              }

              // Get user info using the access token
              const userInfo = await this.getUserInfo(response.access_token);
              
              // Send to backend to create/authenticate user
              const backendResponse = await this.authenticateWithBackend(userInfo, response.access_token);
              
              resolve(backendResponse);
            } catch (error) {
              console.error('Error in Google OAuth callback:', error);
              reject(error);
            }
          }
        });

        // Request access token - this will show the Google account picker
        client.requestAccessToken();
      });
    } catch (error) {
      console.error('Google OAuth initialization error:', error);
      throw error; // Re-throw the error with the specific message
    }
  }

  // Get user information from Google
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info from Google: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to retrieve user information from Google');
    }
  }

  // Authenticate with our backend
  protected async authenticateWithBackend(googleUser: GoogleUser, accessToken: string): Promise<GoogleAuthResponse> {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          access_token: accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Backend authentication failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Backend authentication error:', error);
      throw new Error('Failed to authenticate with our servers. Please try again.');
    }
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

  // Check if Google OAuth is available
  isAvailable(): boolean {
    return this.isProperlyConfigured();
  }
}

// Create and export the real Google auth service
const googleAuthService = new GoogleAuthService();

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
