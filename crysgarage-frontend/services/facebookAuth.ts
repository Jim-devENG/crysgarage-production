// Facebook Authentication Service
// This is a mock implementation for development purposes
// In production, you would integrate with Facebook SDK

interface FacebookUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface FacebookAuthResponse {
  user: FacebookUser;
  token: string;
}

class FacebookAuthService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // In production, you would initialize Facebook SDK here
    // FB.init({
    //   appId: process.env.REACT_APP_FACEBOOK_APP_ID,
    //   cookie: true,
    //   xfbml: true,
    //   version: 'v18.0'
    // });
    
    this.isInitialized = true;
    console.log('Facebook Auth Service initialized');
  }

  async signInWithFacebook(): Promise<FacebookAuthResponse> {
    await this.initialize();

    // Simulate Facebook authentication with account picker
    console.log('🔐 Mock Facebook OAuth: Showing account picker...');
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Simulate successful authentication
          const mockUser: FacebookUser = {
            id: `fb_${Date.now()}`,
            name: 'Facebook User',
            email: `facebook_${Date.now()}@example.com`,
            picture: 'https://via.placeholder.com/150'
          };

          const mockToken = `fb_token_${Date.now()}`;

          // Authenticate with backend
          const backendResponse = await this.authenticateWithBackend(mockUser, mockToken);
          
          resolve(backendResponse);
        } catch (error) {
          reject(error);
        }
      }, 2000);
    });
  }

  // Authenticate with our backend
  private async authenticateWithBackend(facebookUser: FacebookUser, accessToken: string): Promise<FacebookAuthResponse> {
    const response = await fetch('/api/auth/facebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        facebook_id: facebookUser.id,
        name: facebookUser.name,
        email: facebookUser.email,
        picture: facebookUser.picture,
        access_token: accessToken
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to authenticate with backend');
    }

    const data = await response.json();
    return {
      user: data.user,
      token: data.token
    };
  }

  async signOut(): Promise<void> {
    // In production, you would call FB.logout() here
    console.log('Facebook sign out');
  }

  isAuthenticated(): boolean {
    // In production, you would check if user is logged in with Facebook
    return false;
  }
}

// Export singleton instance
const facebookAuthService = new FacebookAuthService();
export default facebookAuthService;
