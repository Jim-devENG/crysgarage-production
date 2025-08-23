// Types
export interface User {
  id: number;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'advanced';
  credits: number;
  join_date: string;
  total_tracks: number;
  total_spent: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

// API Base URL - Updated to work with both local and live server
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
                     (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
                     ? 'http://localhost:8000/api' 
                     : 'https://crysgarage.studio/api';

// Token management
const TOKEN_KEY = 'crysgarage_token';
const USER_KEY = 'crysgarage_user';

export const tokenService = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser: (user: User): void => {
    if (user && typeof user === 'object') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  clearAuth: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// API helper - Updated to work with your existing API structure
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = tokenService.getToken();
  
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
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication service - Updated to use Laravel endpoints
export const authService = {
  // Login user - Updated to use Laravel AuthController
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const { user, token } = response;
      
      // Store auth data
      tokenService.setToken(token);
      tokenService.setUser(user);

      return { user, token };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    }
  },

  // Signup user - Updated to use Laravel AuthController
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const { user, token } = response;
      
      // Store auth data
      tokenService.setToken(token);
      tokenService.setUser(user);

      return { user, token };
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error('Failed to create account. Please try again.');
    }
  },

  // Logout user - Updated to use Laravel AuthController
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint if available
      await apiRequest('/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local storage
      tokenService.clearAuth();
    }
  },

  // Get current user - Updated to use Laravel AuthController
  getCurrentUser: (): User | null => {
    return tokenService.getUser();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return tokenService.getToken() !== null;
  },

  // Refresh user data from server
  refreshUser: async (): Promise<User | null> => {
    try {
      const response = await apiRequest('/auth/user', {
        method: 'GET',
      });
      
      const user = response.user;
      tokenService.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  }
};

// Export default
export default authService;
