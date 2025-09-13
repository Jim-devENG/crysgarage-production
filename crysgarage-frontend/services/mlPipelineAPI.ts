import axios from 'axios';

// ML Pipeline API Configuration - Use Laravel backend instead of direct ML pipeline
export const ML_PIPELINE_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://crysgarage.studio/api';

// Create axios instance for ML Pipeline
export const mlPipelineAPI = axios.create({
  baseURL: ML_PIPELINE_BASE_URL,
  timeout: 60000, // 60 second timeout for ML processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for ML Pipeline
mlPipelineAPI.interceptors.request.use(
  (config) => {
    console.log('ML Pipeline Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('ML Pipeline Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for ML Pipeline
mlPipelineAPI.interceptors.response.use(
  (response) => {
    console.log('ML Pipeline Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('ML Pipeline Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Types for ML Pipeline
export interface MLHealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  endpoints: Record<string, string>;
}

export interface MLUploadRequest {
  audio: File; // Changed to File object for proper upload
  tier: 'free' | 'professional' | 'advanced' | 'one_on_one'; // Match Laravel tier names
  genre: 'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general';
}

export interface MLUploadResponse {
  status: string;
  message: string;
  audio_id: string;
  estimated_processing_time: string;
}

export interface MLProcessRequest {
  audio_id: string;
}

export interface MLRecommendations {
  eq: {
    low: number;
    mid: number;
    high: number;
  };
  compression: {
    ratio: number;
    threshold: number;
  };
  genre: string;
  stereo_width?: number;
  harmonic_exciter?: {
    amount: number;
  };
}

export interface MLProcessResponse {
  status: string;
  message: string;
  audio_id: string;
  processing_time: string;
  download_urls: Record<string, string>;
  ml_recommendations: MLRecommendations;
}

// ML Pipeline API Functions
export const mlPipelineService = {
  // Health check
  healthCheck: async (): Promise<MLHealthResponse> => {
    const response = await mlPipelineAPI.get('/api/health.php');
    return response.data;
  },

  // Upload audio file - Use Laravel backend
  uploadAudio: async (uploadData: MLUploadRequest): Promise<MLUploadResponse> => {
    const formData = new FormData();
    formData.append('audio', uploadData.audio);
    formData.append('tier', uploadData.tier);
    formData.append('genre', uploadData.genre);
    
    const response = await mlPipelineAPI.post('/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Process audio - Use Laravel backend
  processAudio: async (processData: MLProcessRequest): Promise<MLProcessResponse> => {
    const response = await mlPipelineAPI.post('/process-audio', processData);
    return response.data;
  },

  // Complete ML Pipeline workflow
  processAudioFile: async (
    file: File, 
    tier: 'free' | 'pro' | 'advanced', 
    genre: 'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general'
  ): Promise<{
    uploadResult: MLUploadResponse;
    processResult: MLProcessResponse;
  }> => {
    try {
      // Step 1: Upload audio to Laravel backend
      const uploadData: MLUploadRequest = {
        audio: file,
        tier: tier as 'free' | 'professional' | 'advanced' | 'one_on_one',
        genre: genre
      };

      console.log('Starting ML Pipeline upload...', uploadData);
      const uploadResult = await mlPipelineService.uploadAudio(uploadData);
      console.log('ML Pipeline upload successful:', uploadResult);

      // Step 2: Process audio
      const processData: MLProcessRequest = {
        audio_id: uploadResult.audio_id
      };

      console.log('Starting ML Pipeline processing...', processData);
      const processResult = await mlPipelineService.processAudio(processData);
      console.log('ML Pipeline processing successful:', processResult);

      return {
        uploadResult,
        processResult
      };
    } catch (error) {
      console.error('ML Pipeline workflow error:', error);
      throw error;
    }
  },

  // Get ML recommendations for a specific genre and tier
  getMLRecommendations: async (
    tier: 'free' | 'pro' | 'advanced',
    genre: 'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general'
  ): Promise<MLRecommendations> => {
    // This is a mock function that generates recommendations
    // In a real implementation, this would call the ML service
    const baseRecommendations: MLRecommendations = {
      eq: { low: 1.0, mid: 1.0, high: 1.0 },
      compression: { ratio: 2.0, threshold: -12.0 },
      genre: genre
    };

    // Genre-specific adjustments
    const genreAdjustments = {
      hip_hop: {
        eq: { low: 1.3, mid: 0.9, high: 1.1 },
        compression: { ratio: 4.0, threshold: -10.0 }
      },
      afrobeats: {
        eq: { low: 1.1, mid: 1.2, high: 1.3 },
        compression: { ratio: 3.0, threshold: -12.0 }
      },
      gospel: {
        eq: { low: 1.0, mid: 1.1, high: 1.0 },
        compression: { ratio: 2.5, threshold: -14.0 }
      },
      highlife: {
        eq: { low: 1.0, mid: 1.0, high: 1.2 },
        compression: { ratio: 2.0, threshold: -12.0 }
      }
    };

    if (genreAdjustments[genre]) {
      Object.assign(baseRecommendations, genreAdjustments[genre]);
    }

    // Tier-specific adjustments
    if (tier === 'pro') {
      baseRecommendations.compression.ratio *= 1.2;
    } else if (tier === 'advanced') {
      baseRecommendations.compression.ratio *= 1.5;
      baseRecommendations.stereo_width = 1.1;
      baseRecommendations.harmonic_exciter = { amount: 0.1 };
    }

    return baseRecommendations;
  },

  // Get available file formats for a tier
  getAvailableFormats: (tier: 'free' | 'pro' | 'advanced'): string[] => {
    const formats = {
      free: ['wav', 'mp3'],
      pro: ['wav', 'mp3', 'flac'],
      advanced: ['wav', 'mp3', 'flac', 'aiff']
    };
    return formats[tier] || formats.free;
  },

  // Get estimated processing time for a tier
  getEstimatedProcessingTime: (tier: 'free' | 'pro' | 'advanced'): string => {
    const times = {
      free: '2-5 minutes',
      pro: '1-3 minutes',
      advanced: '30 seconds - 2 minutes'
    };
    return times[tier] || times.free;
  }
};

export default mlPipelineService;

