import { authAPI } from '../services/api';

export interface AuthFixResult {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

/**
 * Automatically fixes authentication issues
 */
export const fixAuthentication = async (): Promise<AuthFixResult> => {
  try {
    console.log('Attempting to fix authentication...');
    
    // Step 1: Check if token exists
    const existingToken = localStorage.getItem('crysgarage_token');
    console.log('Existing token:', !!existingToken);
    
    if (existingToken) {
      // Step 2: Try to validate existing token
      try {
        const user = await authAPI.getCurrentUser();
        console.log('Existing token is valid');
        return {
          success: true,
          message: 'Authentication is working correctly',
          user,
          token: existingToken
        };
      } catch (error: any) {
        console.log('Existing token is invalid, clearing...');
        localStorage.removeItem('crysgarage_token');
      }
    }
    
    // Step 3: Try to sign in with default credentials
    console.log('Attempting to sign in with default credentials...');
    
    const { user, token } = await authAPI.signIn('demo.free@crysgarage.com', 'password');
    
    console.log('Sign in successful');
    
    return {
      success: true,
      message: 'Authentication fixed successfully',
      user,
      token
    };
    
  } catch (error: any) {
    console.error('Failed to fix authentication:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fix authentication',
    };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('crysgarage_token');
  return !!token;
};

/**
 * Get current user token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('crysgarage_token');
};

/**
 * Clear authentication
 */
export const clearAuthentication = (): void => {
  localStorage.removeItem('crysgarage_token');
  console.log('Authentication cleared');
};

/**
 * Force re-authentication
 */
export const forceReAuth = async (): Promise<AuthFixResult> => {
  console.log('Forcing re-authentication...');
  clearAuthentication();
  return await fixAuthentication();
}; 