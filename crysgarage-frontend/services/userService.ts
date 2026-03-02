/**
 * User Service
 * Fetches user data from backend - the AUTHORITATIVE source for credits and profile data
 * Firebase is only used for authentication - backend owns user data
 */

export interface BackendUser {
  id: string;
  email?: string;
  name?: string;
  tier: string;
  credits: number; // Legacy field for backward compatibility
  free_credits: number; // Free tier credits from backend
  advanced_credits: number; // Advanced tier credits from backend
}

class UserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8002' 
      : 'https://crysgarage.studio';
  }

  /**
   * Sync Firebase user to backend - IDEMPOTENT
   * Creates user if doesn't exist, returns existing user if exists.
   * MUST be called immediately after Firebase authentication.
   * 
   * CRITICAL: Backend user MUST exist before credits or downloads.
   */
  async syncUser(userId: string, email?: string, name?: string, tier: string = 'free'): Promise<BackendUser> {
    try {
      const url = `${this.baseUrl}/users/sync`;
      
      if (import.meta.env.DEV) {
        console.log('🔧 UserService.syncUser - Request:', { url, userId, email, name, tier });
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          email: email,
          name: name,
          tier: tier
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error response:', errorData);
        throw new Error(errorData.detail || `Failed to sync user: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (import.meta.env.DEV) {
        console.log('✅ UserService.syncUser - Success:', data);
      }
      
      return {
        id: data.id || userId,
        email: data.email || email || undefined,
        name: data.name || name || undefined,
        tier: data.tier || 'free',
        credits: data.credits || 0, // Legacy field for backward compatibility
        free_credits: data.free_credits || 0, // Free tier credits from backend
        advanced_credits: data.advanced_credits || 0, // Advanced tier credits from backend
      };
    } catch (error) {
      console.error('❌ Error syncing user:', error);
      throw error;
    }
  }

  /**
   * Fetch user profile from backend - AUTHORITATIVE source for credits
   * Firebase only provides authentication - backend owns user data
   * 
   * CRITICAL: Returns 404 if user doesn't exist - user MUST be synced first via syncUser()
   * CRITICAL: This method is called frequently - avoid console spam in production
   */
  async getUserProfile(userId: string): Promise<BackendUser> {
    try {
      const url = `${this.baseUrl}/me?user_id=${encodeURIComponent(userId)}`;
      
      // FIXED: Reduced console logging to prevent spam
      // Only log in development or on errors
      if (import.meta.env.DEV) {
        console.log('🔧 UserService.getUserProfile - Request:', { url, userId });
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // FIXED: Only log response details in development or on errors
      if (import.meta.env.DEV && !response.ok) {
        console.log('🔧 UserService.getUserProfile - Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });
      }

      // Check content-type before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response from backend:', text);
        throw new Error(`Non-JSON response from backend (${response.status}): ${text.slice(0, 200)}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error response:', errorData);
        throw new Error(errorData.detail || `Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();
      
      // FIXED: Only log success in development to prevent console spam
      if (import.meta.env.DEV) {
        console.log('✅ UserService.getUserProfile - Success:', data);
      }
      
      return {
        id: data.id || userId,
        email: data.email || undefined,
        name: data.name || undefined,
        tier: data.tier || 'free',
        credits: data.credits || 0, // Legacy field for backward compatibility
        free_credits: data.free_credits || 0, // Free tier credits from backend
        advanced_credits: data.advanced_credits || 0, // Advanced tier credits from backend
      };
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;

