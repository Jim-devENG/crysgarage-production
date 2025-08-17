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

// API Base URL - Updated to work with your live server
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'https://crysgarage.studio/api';

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
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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

// Authentication service - Updated to work with your live server
export const authService = {
  // Login user - Updated to use your existing auth.php endpoint
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiRequest('/auth.php/signin', {
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

  // Signup user - Updated to use your existing auth.php endpoint
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiRequest('/auth.php/signup', {
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

  // Logout user - Updated to use your existing auth.php endpoint
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint if available
      await apiRequest('/auth.php/signout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local storage
      tokenService.clearAuth();
    }
  },

  // Get current user - Updated to use your existing auth.php endpoint
  getCurrentUser: (): User | null => {
    return tokenService.getUser();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = tokenService.getToken();
    const user = tokenService.getUser();
    return !!(token && user);
  },

  // Refresh user data - Updated to use your existing auth.php endpoint
  refreshUser: async (): Promise<User | null> => {
    try {
      const response = await apiRequest('/auth.php/user');
      const user = response.user;
      tokenService.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  },

  // Update user profile - Updated to use your existing auth.php endpoint
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    try {
      const response = await apiRequest('/auth.php/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const user = response.user;
      tokenService.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    }
  },

  // Change password - Updated to use your existing auth.php endpoint
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiRequest('/auth.php/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw new Error('Failed to change password');
    }
  },

  // Request password reset - Updated to use your existing auth.php endpoint
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await apiRequest('/auth.php/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Failed to request password reset:', error);
      throw new Error('Failed to send reset email');
    }
  },

  // Reset password - Updated to use your existing auth.php endpoint
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiRequest('/auth.php/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw new Error('Failed to reset password');
    }
  }
};

// Export default
export default authService;
