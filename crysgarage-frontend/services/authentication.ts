// Clean Authentication Service
export interface User {
  id: number;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'advanced';
  credits: number;
  join_date: string;
  total_tracks: number;
  total_spent: number;
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
  profile_picture?: string;
  kyc_verified?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Legacy aliases for compatibility
export type SignupCredentials = SignupData;
export type LoginCredentials = LoginData;

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Storage Keys
const TOKEN_KEY = 'crysgarage_token';
const USER_KEY = 'crysgarage_user';

// Token Management
export const tokenManager = {
  getToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('tokenManager.getToken():', token ? 'Token found' : 'No token');
    return token;
  },

  setToken: (token: string): void => {
    console.log('tokenManager.setToken():', token ? 'Token set' : 'No token provided');
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    console.log('tokenManager.removeToken(): Removing token');
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
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
      console.error('Error parsing user data:', error);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser: (user: User): void => {
    console.log('tokenManager.setUser(): Setting user =', user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser: (): void => {
    console.log('tokenManager.removeUser(): Removing user');
    localStorage.removeItem(USER_KEY);
  },

  clearAuth: (): void => {
    console.log('tokenManager.clearAuth(): Clearing all auth data');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// API Request Helper
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = tokenManager.getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle Laravel validation errors
      if (errorData.errors) {
        const firstError = Object.values(errorData.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          throw new Error(firstError[0]);
        }
      }
      
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('API request failed:', error);
    
    // For development: if connection is refused, provide helpful error
    if (error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Failed to fetch')) {
      throw new Error('Backend server is not running. Please start the Laravel backend server.');
    }
    
    throw error;
  }
};

// Authentication Service
export const authService = {
  // Sign up new user
  signup: async (data: SignupData): Promise<AuthResponse> => {
    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const { user, token } = response;
      
      tokenManager.setToken(token);
      tokenManager.setUser(user);

      return { user, token };
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  },

  // Sign in user
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const { user, token } = response;
      
      tokenManager.setToken(token);
      tokenManager.setUser(user);

      return { user, token };
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Invalid email or password.');
    }
  },

  // Sign out user
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      tokenManager.clearAuth();
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return tokenManager.getUser();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return tokenManager.getToken() !== null;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      const user = response.user;
      tokenManager.setUser(user);
      return user;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw new Error(error.message || 'Failed to update profile. Please try again.');
    }
  },

  // Refresh user data from server
  refreshUser: async (): Promise<User | null> => {
    try {
      const response = await apiRequest('/auth/user', {
        method: 'GET',
      });
      const user = response.user;
      tokenManager.setUser(user);
      return user;
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  }
};

export default authService;
