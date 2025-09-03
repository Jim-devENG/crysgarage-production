import axios from 'axios';

// API base configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crysgarage.studio/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crysgarage_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      hasToken: !!token,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    // Don't automatically clear token on 401 - let the app handle it
    // This prevents authentication loss during upload
    if (error.response?.status === 401) {
      console.log('401 error detected - letting app handle authentication');
      // Don't clear token automatically
      // Don't redirect automatically
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface User {
  id: number;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'advanced';
  credits: number;
  join_date: string;
  total_tracks: number;
  total_spent: number;
  // KYC Fields
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
  // Legacy fields
  avatar?: string;
  username?: string;
  role?: 'member' | 'moderator' | 'admin' | 'premium';
  joinDate?: string;
  posts?: number;
  followers?: number;
  following?: number;
  badges?: string[];
}

export interface AudioStatus {
  audio_id: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  progress: number;
  genre?: string;
  tier?: string;
  file_name?: string;
  output_files?: Record<string, string>;
  metadata?: {
    processing_time: number;
    final_lufs: number;
    true_peak: number;
    dynamic_range: number;
    genre?: string;
    tier?: string;
  };
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface MasteringSession {
  id: string;
  user_id: number;
  file_name: string;
  file_size: number;
  genre: string;
  tier: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ProcessingConfiguration {
  sample_rate: number;
  bit_depth: number;
  target_lufs: number;
  true_peak: number;
  eq_settings: Record<string, number>;
  compression_settings: Record<string, number>;
  stereo_width: number;
  genre?: string;
  tier?: string;
}

export interface MasteringResult {
  session_id: string;
  output_files: {
    wav: string;
    mp3: string;
    flac: string;
  };
  metadata: {
    processing_time: number;
    final_lufs: number;
    true_peak: number;
    dynamic_range: number;
  };
  download_urls: {
    wav: string;
    mp3: string;
    flac: string;
  };
}

export interface Addon {
  id: number;
  name: string;
  description: string;
  price: number;
  required_tier: 'free' | 'pro' | 'advanced';
  category: string;
  features: string[];
  is_purchased: boolean;
}

export interface TierFeatures {
  name: string;
  max_file_size: number;
  max_tracks_per_month: number;
  supported_formats: string[];
  supported_genres: string[];
  processing_quality: string;
  download_formats: string[];
  features: string[];
  limitations: string[];
}

export interface TierDashboard {
  user_info: {
    name: string;
    email: string;
    tier: string;
    credits: number;
    join_date: string;
  };
  audio_stats: {
    total_tracks: number;
    recent_tracks: any[];
  };
  tier_specific: {
    tracks_remaining?: number;
    upgrade_prompt?: boolean;
    unlimited_tracks?: boolean;
    processing_queue?: any[];
    advanced_analytics?: any;
    quick_actions: Record<string, boolean>;
  };
}

export interface TierUploadOptions {
  max_file_size: number;
  supported_formats: string[];
  supported_genres: string[];
  upload_methods: {
    drag_drop: boolean;
    file_picker: boolean;
    url_upload: boolean;
    batch_upload: boolean;
  };
  processing_options: {
    custom_settings: boolean;
    presets: boolean;
    advanced_algorithms: boolean;
  };
}

export interface TierProcessingOptions {
  quality: string;
  download_formats: string[];
  processing_features: {
    real_time_progress: boolean;
    processing_history: boolean;
    comparison_tools: boolean;
    advanced_analytics: boolean;
    custom_algorithms: boolean;
  };
  priority_processing: boolean;
}

export interface TierStats {
  total_tracks: number;
  completed_tracks: number;
  total_size_mb: number;
  success_rate: number;
  tracks_remaining?: number;
  unlimited_tracks?: boolean;
  upgrade_benefits?: Record<string, string>;
  processing_efficiency?: {
    avg_processing_time: number;
    total_processing_time: number;
    efficiency_score: number;
  };
  popular_genres?: any[];
  advanced_metrics?: {
    file_size_distribution: Record<string, number>;
    processing_success_rate: number;
    peak_usage_times: Record<string, number>;
  };
}

// Authentication API
export const authAPI = {
  // Sign in user
  signIn: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/auth.php/signin', { email, password });
      console.log('Backend signin response:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data || !response.data.user) {
        console.error('Backend response missing user data:', response.data);
        throw new Error('Invalid response from server');
      }
      
      const { user, token } = response.data;
      localStorage.setItem('crysgarage_token', token);
      return { user, token };
    } catch (error) {
      console.error('Backend signin failed, using mock authentication:', error);
      
      // Mock authentication as fallback
      const storedUser = localStorage.getItem('crysgarage_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email === email) {
          const mockToken = btoa(JSON.stringify({
            user_id: user.id,
            email: user.email,
            exp: Date.now() + (24 * 60 * 60 * 1000)
          }));
          
          localStorage.setItem('crysgarage_token', mockToken);
          return { user, token: mockToken };
        }
      }
      
      throw new Error('Invalid email or password');
    }
  },

  // Sign up user
  signUp: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/auth.php/signup', { name, email, password });
      console.log('Backend signup response:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data || !response.data.user) {
        console.error('Backend response missing user data:', response.data);
        throw new Error('Invalid response from server');
      }
      
      const { user, token } = response.data;
      localStorage.setItem('crysgarage_token', token);
      return { user, token };
    } catch (error) {
      console.error('Backend signup failed, using mock authentication:', error);
      
      // Mock authentication as fallback
      const mockUser: User = {
        id: Date.now(),
        name: name,
        email: email,
        tier: 'free',
        credits: 3,
        join_date: new Date().toISOString().split('T')[0],
        total_tracks: 0,
        total_spent: 0
      };
      
      const mockToken = btoa(JSON.stringify({
        user_id: mockUser.id,
        email: mockUser.email,
        exp: Date.now() + (24 * 60 * 60 * 1000)
      }));
      
      localStorage.setItem('crysgarage_token', mockToken);
      localStorage.setItem('crysgarage_user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
    }
  },

  // Sign out user
  signOut: async (): Promise<void> => {
    try {
      await api.post('/auth.php/signout');
    } catch (error) {
      console.error('Backend signout failed, using mock authentication:', error);
    } finally {
      localStorage.removeItem('crysgarage_token');
      localStorage.removeItem('crysgarage_user');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth.php/user');
      return response.data;
    } catch (error) {
      console.error('Backend getCurrentUser failed, using mock authentication:', error);
      
      // Mock authentication as fallback
      const storedUser = localStorage.getItem('crysgarage_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      throw new Error('No user found');
    }
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh');
    const { token } = response.data;
    localStorage.setItem('crysgarage_token', token);
    return { token };
  },
};

// User management API
export const userAPI = {
  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (current_password: string, new_password: string): Promise<{ success: boolean }> => {
    const response = await api.put('/user/password', { current_password, new_password });
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<{ success: boolean }> => {
    const response = await api.delete('/user/account');
    localStorage.removeItem('crysgarage_token');
    return response.data;
  },
};

// Audio processing API - Updated to match Laravel endpoints
export const audioAPI = {
  // Public upload (no authentication required)
  publicUpload: async (file: File, genre?: string): Promise<{ 
    success: boolean;
    audio_id: string;
    message: string;
    status: string;
  }> => {
    console.log('=== PUBLIC UPLOAD FILE DEBUG ===');
    console.log('File:', file.name, 'Size:', file.size);
    console.log('Genre:', genre);
    
    const formData = new FormData();
    formData.append('audio', file);
    if (genre && genre.trim() !== '') {
      formData.append('genre', genre);
    }

    try {
      // Use axios directly without the authenticated api instance
      const response = await axios.post(`${API_BASE_URL}/public/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for uploads
      });
      console.log('Public upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== PUBLIC UPLOAD ERROR ===');
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Request config:', error.config);
      throw error;
    }
  },

  // Upload audio file (authenticated)
  uploadFile: async (file: File, genre?: string): Promise<{ 
    audio_id: string;
    credits_deducted?: number;
    remaining_credits?: number;
  }> => {
    console.log('=== UPLOAD FILE DEBUG ===');
    console.log('File:', file.name, 'Size:', file.size);
    console.log('Genre:', genre);
    
    // Check if token exists
    const token = localStorage.getItem('crysgarage_token');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    const formData = new FormData();
    formData.append('audio', file);
    if (genre && genre.trim() !== '') {
      formData.append('genre', genre);
    }

    try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      console.log('Upload successful:', response.data);
    return response.data;
    } catch (error: any) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Request config:', error.config);
      throw error;
    }
  },

  // Get audio status (authenticated)
  getStatus: async (audioId: string): Promise<AudioStatus> => {
    const response = await api.get(`/status/${audioId}`);
    return response.data;
  },

  // Public status check (no authentication required)
  publicGetStatus: async (audioId: string): Promise<AudioStatus> => {
    const response = await axios.get(`${API_BASE_URL}/public/status/${audioId}`);
    return response.data;
  },

  // Download mastered file
  downloadFile: async (audioId: string, format: 'wav' | 'mp3' | 'flac'): Promise<Blob> => {
    const response = await api.get(`/audio/${audioId}/download/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get download URLs
  getDownloadUrls: async (audioId: string): Promise<{
    wav: string;
    mp3: string;
    flac: string;
  }> => {
    const response = await api.get(`/audio/${audioId}/download-urls`);
    return response.data;
  },

  // Start mastering process
  startMastering: async (audioId: string, data: { genre: string; config: ProcessingConfiguration }): Promise<{ session_id: string }> => {
    const response = await api.post(`/mastering/${audioId}/start`, data);
    return response.data;
  },

  // Get mastering session
  getSession: async (sessionId: string): Promise<MasteringSession> => {
    const response = await api.get(`/mastering/${sessionId}`);
    return response.data;
  },

  // Get mastering result
  getResult: async (sessionId: string): Promise<MasteringResult> => {
    const response = await api.get(`/mastering/${sessionId}/result`);
    return response.data;
  },

  // Get mastering results with audio URLs
  getMasteringResults: async (audioId: string): Promise<{
    audio_id: string;
    file_name: string;
    genre: string;
    tier: string;
    original_audio_url: string;
    mastered_audio_url: string;
    output_files: {
      wav: string;
      mp3: string;
      flac: string;
    };
    metadata: {
      processing_time: number;
      final_lufs: number;
      true_peak: number;
      dynamic_range: number;
    };
    download_urls: {
      wav: string;
      mp3: string;
      flac: string;
    };
  }> => {
    // For development, use the test endpoint that doesn't require authentication
    const endpoint = import.meta.env.MODE === 'development' ? `/test/mastering/${audioId}/results` : `/mastering/${audioId}/results`;
    const response = await api.get(endpoint);
    
    // If using test endpoint, create mock data with public endpoints
    if (import.meta.env.MODE === 'development' && endpoint.includes('/test/')) {
      return {
        audio_id: audioId,
        file_name: 'test_audio.wav',
        genre: 'afrobeats',
        tier: 'professional',
        original_audio_url: `http://127.0.0.1:8000/api/public/audio/${audioId}/original`,
        mastered_audio_url: `http://127.0.0.1:8000/api/public/audio/${audioId}/download/wav`,
        output_files: {
          wav: `http://127.0.0.1:8000/api/public/audio/${audioId}/download/wav`,
          mp3: `http://127.0.0.1:8000/api/public/audio/${audioId}/download/mp3`,
          flac: `http://127.0.0.1:8000/api/public/audio/${audioId}/download/flac`,
        },
        metadata: {
          processing_time: 120,
          final_lufs: -14.2,
          true_peak: -0.8,
          dynamic_range: 12.5,
        },
        download_urls: {
          wav: `http://127.0.0.1:8000/api/public/audio/${audioId}/download/wav`,
          mp3: `http://127.0.0.1:8000/api/public/audio/${audioId}/download/mp3`,
          flac: `http://127.0.0.1:8000/api/public/audio/${audioId}/download/flac`,
        },
      };
    }
    
    return response.data;
  },

  // Cancel mastering process
  cancelMastering: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/mastering/${sessionId}/cancel`);
    return response.data;
  },
};

// Paystack Payment Gateway
export const paystackAPI = {
  // Initialize Paystack payment (public endpoint - no auth required)
  initializePayment: async (amount: number, email: string, reference: string, metadata: any = {}) => {
    try {
      console.log('Initializing Paystack payment:', { amount, email, reference, metadata });
      
      // Use the working test endpoint temporarily
      const response = await fetch(`${API_BASE_URL}/test-paystack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
          email,
          reference,
          metadata,
          callback_url: `${window.location.origin}/payment/callback`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Paystack success response:', data);
      
      // Extract the actual Paystack response from the test endpoint
      if (data.paystack_response && data.paystack_response.status) {
        return data.paystack_response;
      }
      
      return data;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  },

  // Verify payment (public endpoint - no auth required)
  verifyPayment: async (reference: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/paystack/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  },

  // Get payment history (requires auth)
  getPaymentHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/paystack/history`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crysgarage_token')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch payment history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  }
};

// Updated Credit System
export const creditsAPI = {
  // Purchase credits based on tier
  purchaseCredits: async (tier: 'free' | 'pro' | 'advanced', paymentMethod: string = 'paystack') => {
    try {
      const tierPricing = {
        free: { credits: 2, price: 4.99 },
        pro: { credits: 12, price: 19.99 },
        advanced: { credits: 25, price: 49.99 }
      };

      const selectedTier = tierPricing[tier];
      
      const response = await fetch(`${API_BASE_URL}/credits/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crysgarage_token')}`
        },
        body: JSON.stringify({
          tier,
          credits: selectedTier.credits,
          amount: selectedTier.price,
          payment_method: paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Failed to purchase credits');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Credit purchase error:', error);
      throw error;
    }
  },

  // Deduct credit for download
  deductCreditForDownload: async (audioId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/deduct-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('crysgarage_token')}`
        },
        body: JSON.stringify({
          audio_id: audioId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to deduct credit');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Credit deduction error:', error);
      throw error;
    }
  },

  // Get current balance
  getBalance: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('crysgarage_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get credit balance');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get balance error:', error);
      throw error;
    }
  },

  // Get credit history
  getCreditHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('crysgarage_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get credit history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Credit history error:', error);
      throw error;
    }
  }
};

// Addon marketplace API
export const addonAPI = {
  // Get available addons
  getAddons: async (): Promise<Addon[]> => {
    const response = await api.get('/addons');
    return response.data;
  },

  // Get user's purchased addons
  getUserAddons: async (): Promise<Addon[]> => {
    const response = await api.get('/user/addons');
    return response.data;
  },

  // Purchase addon
  purchaseAddon: async (addonId: number, payment_method: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/addons/${addonId}/purchase`, { payment_method });
    return response.data;
  },
};

// Analytics and monitoring API
export const analyticsAPI = {
  // Get processing statistics
  getStats: async (): Promise<{
    total_processes: number;
    success_rate: number;
    average_processing_time: number;
    popular_genres: Record<string, number>;
  }> => {
    const response = await api.get('/analytics/stats');
    return response.data;
  },

  // Get user analytics
  getUserAnalytics: async (): Promise<{
    total_tracks: number;
    total_processing_time: number;
    favorite_genres: string[];
    tier_usage: Record<string, number>;
  }> => {
    const response = await api.get('/analytics/user');
    return response.data;
  },
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = (audioId: string) => {
  const ws = new WebSocket(`ws://localhost:8000/ws/audio/${audioId}`);

  ws.onopen = () => {
    console.log('WebSocket connected for audio:', audioId);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('WebSocket message:', data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };

  return ws;
};

// Mastering API
export const masteringAPI = {
  // Start mastering process
  startMastering: async (file: File, genre: string, tier: string, config?: ProcessingConfiguration): Promise<{ session_id: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('genre', genre);
    formData.append('tier', tier);
    
    if (config) {
      formData.append('config', JSON.stringify(config));
    }
    
    const response = await api.post('/mastering/start', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get mastering status
  getStatus: async (sessionId: string): Promise<AudioStatus> => {
    const response = await api.get(`/mastering/${sessionId}/status`);
    return response.data;
  },

  // Get mastering result
  getResult: async (sessionId: string): Promise<MasteringResult> => {
    const response = await api.get(`/mastering/${sessionId}/result`);
    return response.data;
  },

  // Cancel mastering process
  cancelMastering: async (sessionId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/mastering/${sessionId}/cancel`);
    return response.data;
  },
};

// Genre API
export const genreAPI = {
  // Get genres for a specific tier
  getGenresForTier: async (tier: string): Promise<{ genres: any[]; tier: string }> => {
    const response = await api.get(`/genres?tier=${tier}`);
    return response.data;
  },
};

// Tier Management API
export const tierAPI = {
  // Get tier-specific features
  getTierFeatures: async (): Promise<{ success: boolean; tier: string; features: TierFeatures }> => {
    const response = await api.get('/tier/features');
    return response.data;
  },

  // Get tier-specific dashboard data
  getTierDashboard: async (): Promise<{ success: boolean; tier: string; dashboard: TierDashboard }> => {
    const response = await api.get('/tier/dashboard');
    return response.data;
  },

  // Get tier-specific upload options
  getTierUploadOptions: async (): Promise<{ success: boolean; tier: string; upload_options: TierUploadOptions }> => {
    const response = await api.get('/tier/upload-options');
    return response.data;
  },

  // Get tier-specific processing options
  getTierProcessingOptions: async (): Promise<{ success: boolean; tier: string; processing_options: TierProcessingOptions }> => {
    const response = await api.get('/tier/processing-options');
    return response.data;
  },

  // Get tier-specific stats
  getTierStats: async (): Promise<{ success: boolean; tier: string; stats: TierStats }> => {
    const response = await api.get('/tier/stats');
    return response.data;
  },

  // Upgrade user tier
  upgradeTier: async (newTier: 'professional' | 'advanced'): Promise<{ 
    success: boolean; 
    message: string; 
    new_tier: string; 
    new_features: TierFeatures 
  }> => {
    const response = await api.post('/tier/upgrade', { new_tier: newTier });
    return response.data;
  },
};

// Audio Quality API
export const audioQualityAPI = {
  // Get audio quality options for a specific tier
  getQualityOptionsForTier: async (tier: string): Promise<{ quality_options: any[]; tier: string }> => {
    const response = await api.get(`/audio-quality?tier=${tier}`);
    return response.data;
  },
};

export default api;