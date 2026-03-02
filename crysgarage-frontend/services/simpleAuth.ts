// Simple Authentication Service - No Backend Required
// This is a self-contained authentication system for development

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'advanced';
  credits: number;
  join_date: string;
  total_tracks: number;
  total_spent: number;
}

export interface AuthResponse {
  success: boolean;
  user?: SimpleUser;
  token?: string;
  message?: string;
}

// Simple user storage
const STORAGE_KEY = 'crysgarage_simple_user';
const TOKEN_KEY = 'crysgarage_simple_token';

// Generate a simple token
const generateToken = (): string => {
  return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Simple user validation
const validateUser = (name: string, email: string, password: string): boolean => {
  return name.length >= 2 && email.includes('@') && password.length >= 6;
};

// Check if email already exists
const emailExists = (email: string): boolean => {
  const existingUsers = JSON.parse(localStorage.getItem('crysgarage_all_users') || '[]');
  return existingUsers.some((user: SimpleUser) => user.email === email);
};

// Save user to "database" (localStorage)
const saveUser = (user: SimpleUser): void => {
  const existingUsers = JSON.parse(localStorage.getItem('crysgarage_all_users') || '[]');
  const userIndex = existingUsers.findIndex((u: SimpleUser) => u.email === user.email);
  
  if (userIndex >= 0) {
    existingUsers[userIndex] = user;
  } else {
    existingUsers.push(user);
  }
  
  localStorage.setItem('crysgarage_all_users', JSON.stringify(existingUsers));
};

// Find user by email
const findUserByEmail = (email: string): SimpleUser | null => {
  const existingUsers = JSON.parse(localStorage.getItem('crysgarage_all_users') || '[]');
  return existingUsers.find((user: SimpleUser) => user.email === email) || null;
};

export const simpleAuthService = {
  // Sign up a new user
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    console.log('SimpleAuth: Signup attempt for:', email);
    
    // Validate input
    if (!validateUser(name, email, password)) {
      return {
        success: false,
        message: 'Please provide valid name (2+ chars), email, and password (6+ chars)'
      };
    }
    
    // Check if email already exists
    if (emailExists(email)) {
      return {
        success: false,
        message: 'An account with this email already exists. Please sign in instead.'
      };
    }
    
    // Create new user
    const newUser: SimpleUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      tier: 'free',
      credits: 0,
      join_date: new Date().toISOString(),
      total_tracks: 0,
      total_spent: 0
    };
    
    // Save user
    saveUser(newUser);
    
    // Generate token
    const token = generateToken();
    
    // Store current session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_KEY, token);
    
    console.log('SimpleAuth: Signup successful for:', email);
    
    return {
      success: true,
      user: newUser,
      token: token,
      message: 'Account created successfully!'
    };
  },
  
  // Sign in existing user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('SimpleAuth: Login attempt for:', email);
    
    // Find user
    const user = findUserByEmail(email.toLowerCase().trim());
    
    if (!user) {
      return {
        success: false,
        message: 'No account found with this email. Please sign up first.'
      };
    }
    
    // For simplicity, we'll accept any password for existing users
    // In a real app, you'd verify the password hash
    
    // Generate token
    const token = generateToken();
    
    // Store current session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    
    console.log('SimpleAuth: Login successful for:', email);
    
    return {
      success: true,
      user: user,
      token: token,
      message: 'Welcome back!'
    };
  },
  
  // Get current user
  getCurrentUser: (): SimpleUser | null => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEY);
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      console.log('SimpleAuth: Current user:', user?.name);
      return user;
    } catch (error) {
      console.error('SimpleAuth: Error getting current user:', error);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(STORAGE_KEY);
    const isAuth = !!(token && user);
    console.log('SimpleAuth: isAuthenticated =', isAuth);
    return isAuth;
  },
  
  // Sign out
  logout: (): void => {
    console.log('SimpleAuth: Logging out');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
  
  // Update user profile
  updateProfile: async (updates: Partial<SimpleUser>): Promise<AuthResponse> => {
    const currentUser = simpleAuthService.getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'No user logged in'
      };
    }
    
    // Update user data
    const updatedUser = { ...currentUser, ...updates };
    saveUser(updatedUser);
    
    // Update current session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    console.log('SimpleAuth: Profile updated for:', updatedUser.email);
    
    return {
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully!'
    };
  }
};

