import axios from 'axios';

// API base configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
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
    
    if (error.response?.status === 401) {
      // Clear token but don't redirect - let the app handle it
      localStorage.removeItem('crysgarage_token');
      console.log('Token cleared due to 401 error');
      
      // Try to refresh token or redirect to login
      if (window.location.pathname !== '/auth') {
        // Store current location for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
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

// Authentication API
export const authAPI = {
  // Sign in user
  signIn: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/signin', { email, password });
    const { user, token } = response.data;
    localStorage.setItem('crysgarage_token', token);
    return { user, token };
  },

  // Sign up user
  signUp: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/signup', { name, email, password });
    const { user, token } = response.data;
    localStorage.setItem('crysgarage_token', token);
    return { user, token };
  },

  // Sign out user
  signOut: async (): Promise<void> => {
    try {
      await api.post('/auth/signout');
    } finally {
      localStorage.removeItem('crysgarage_token');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data;
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
    const endpoint = import.meta.env.DEV ? `/test/mastering/${audioId}/results` : `/mastering/${audioId}/results`;
    const response = await api.get(endpoint);
    
    // If using test endpoint, create mock data with public endpoints
    if (import.meta.env.DEV && endpoint.includes('/test/')) {
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

// Credits and billing API
export const creditsAPI = {
  // Get credit balance
  getBalance: async (): Promise<{ credits: number; tier: string }> => {
    const response = await api.get('/credits/balance');
    return response.data;
  },

  // Purchase credits
  purchaseCredits: async (amount: number, payment_method: string): Promise<{ success: boolean; credits_added: number }> => {
    const response = await api.post('/credits/purchase', { amount, payment_method });
    return response.data;
  },

  // Get credit history
  getHistory: async (): Promise<Array<{
    id: number;
    type: 'purchase' | 'usage' | 'refund';
    amount: number;
    description: string;
    created_at: string;
  }>> => {
    const response = await api.get('/credits/history');
    return response.data;
  },
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

// Audio Quality API
export const audioQualityAPI = {
  // Get audio quality options for a specific tier
  getQualityOptionsForTier: async (tier: string): Promise<{ quality_options: any[]; tier: string }> => {
    const response = await api.get(`/audio-quality?tier=${tier}`);
    return response.data;
  },
};

export default api; 