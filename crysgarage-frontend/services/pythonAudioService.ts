/**
 * Python Audio Processing Service
 * Integrates with the Python microservice for tier-based audio mastering
 */

import axios from 'axios';

// Route Python calls: local dev -> localhost:8002, production -> nginx proxy /api/python
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const PYTHON_SERVICE_URL = isLocal ? 'http://localhost:8002' : 'https://crysgarage.studio/api/python';
const LARAVEL_API_BASE = isLocal ? 'http://localhost:8000' : '';

export interface TierInfo {
  processing_quality: string;
  max_processing_time: number;
  available_formats: string[];
  max_sample_rate: number;
  max_bit_depth: number;
  features: {
    stereo_widening: boolean;
    harmonic_exciter: boolean;
    multiband_compression: boolean;
    advanced_features: boolean;
  };
  processing_limits: {
    eq_bands: number;
    compression_ratio_max: number;
  };
}

export interface GenreInfo {
  eq_curve: {
    low_shelf: { freq: number; gain: number };
    low_mid: { freq: number; gain: number };
    mid: { freq: number; gain: number };
    high_mid: { freq: number; gain: number };
    high_shelf: { freq: number; gain: number };
  };
  compression: {
    ratio: number;
    threshold: number;
    attack: number;
    release: number;
  };
  stereo_width: number;
  target_lufs: number;
}

export interface MasteringRequest {
  user_id: string;
  tier: 'free' | 'professional' | 'advanced' | 'one_on_one';
  genre: string;
  target_lufs?: number;
  file_url: string;
  target_format?: string;
  target_sample_rate?: number;
}

export interface MasteringResponse {
  status: string;
  url: string;
  lufs: number;
  format: string;
  duration: number;
  processing_time: number;
  sample_rate?: number;
  file_size?: number;
  // ML extras
  ml_summary?: Array<{ area: string; action: string; reason?: string }>;
  applied_params?: Record<string, any>;
}

export interface IndustryPresetsResponse {
  presets: Record<string, GenreInfo>;
}

class PythonAudioService {
  private baseURL: string;
  private presetsCache: Record<string, GenreInfo> | null = null;

  constructor() {
    this.baseURL = PYTHON_SERVICE_URL;
  }
  async analyzeOriginal(file: File, userId: string): Promise<{ lufs?: number; duration?: number; sample_rate?: number; file_size?: number }> {
    try {
      // On production, do not block UI with analysis; return immediately
      if (!isLocal) {
        return {};
      }
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('user_id', userId);
      const response = await axios.post(`${this.baseURL}/analyze-file`, formData, {
        timeout: 10000,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.metadata || {};
    } catch (e) {
      console.error('Analyze original failed:', e);
      return {};
    }
  }

  async analyzeML(file: File, userId: string, genre: string): Promise<{ ml_summary?: Array<{ area: string; action: string; reason?: string }>; predicted_params?: Record<string, any> }> {
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('user_id', userId);
      formData.append('genre', genre || 'Auto');
      const response = await axios.post(`${this.baseURL}/analyze-ml`, formData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { ml_summary: response.data.ml_summary, predicted_params: response.data.predicted_params };
    } catch (e) {
      console.error('Analyze ML failed:', e);
      return {} as any;
    }
  }

  /**
   * Get tier information from Python service
   */
  async getTierInformation(): Promise<Record<string, TierInfo>> {
    try {
      const response = await axios.get(`${this.baseURL}/tiers`);
      return response.data.tiers;
    } catch (error) {
      console.error('Failed to get tier information:', error);
      throw new Error('Failed to get tier information from Python service');
    }
  }

  /**
   * Get genre information from Python service
   */
  async getGenreInformation(): Promise<Record<string, GenreInfo>> {
    try {
      const response = await axios.get(`${this.baseURL}/genres`);
      return response.data.genres;
    } catch (error) {
      console.error('Failed to get genre information:', error);
      throw new Error('Failed to get genre information from Python service');
    }
  }

  /**
   * Get available genres for a specific tier
   */
  async getAvailableGenresForTier(tier: string): Promise<string[]> {
    try {
      const tierInfo = await this.getTierInformation();
      const genreInfo = await this.getGenreInformation();
      
      // For free tier, return only 2 genres
      if (tier === 'free') {
        return ['Hip-Hop', 'Afrobeats'];
      }
      
      // For other tiers, return all available genres
      return Object.keys(genreInfo);
    } catch (error) {
      console.error('Failed to get available genres for tier:', error);
      return ['Hip-Hop', 'Afrobeats']; // Fallback
    }
  }

  /**
   * Process audio with Python microservice
   */
  async processAudio(request: MasteringRequest): Promise<MasteringResponse> {
    try {
      console.log('Sending mastering request to Python service:', request);
      
      const response = await axios.post(`${this.baseURL}/master`, request, {
        timeout: 300000, // 5 minutes timeout for processing
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Python audio processing failed:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request parameters');
      } else if (error.response?.status === 413) {
        throw new Error('File too large for processing');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported file format');
      } else if (error.response?.status === 500) {
        throw new Error('Audio processing failed on server');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Processing timeout - file may be too large or complex');
      } else {
        throw new Error('Failed to process audio: ' + (error.message || 'Unknown error'));
      }
    }
  }

  /**
   * Upload file to Laravel backend first, then process with Python
   */
  async uploadAndProcessAudio(
    file: File,
    tier: 'free' | 'professional' | 'advanced' | 'one_on_one',
    genre: string,
    userId: string,
    format: 'mp3' | 'wav' = 'mp3'
  ): Promise<MasteringResponse> {
    try {
      if (isLocal) {
        // Local dev path: upload to Laravel then call Python /master
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('tier', tier);
        formData.append('genre', genre);
        formData.append('user_id', userId);

        console.log('Uploading file to Laravel backend...');
        const uploadResponse = await axios.post(
          `${LARAVEL_API_BASE}/api/upload-audio`,
          formData
        );

        const { file_url } = uploadResponse.data;
        console.log('File uploaded successfully:', file_url);

        const masteringRequest: MasteringRequest = {
          user_id: userId,
          tier: tier.charAt(0).toUpperCase() + tier.slice(1) as any,
          genre: genre as any,
          target_format: (format.toUpperCase()) as any,
          target_sample_rate: 44100 as any,
          file_url,
          target_lufs: -14.0,
        };

        console.log('Processing with Python microservice...');
        const result = await this.processAudio(masteringRequest);
        return result;
      } else {
        // Production path: try Python direct upload first; on 404 fallback to Laravel upload + /master
        try {
          const formData = new FormData();
          formData.append('audio', file);
          formData.append('tier', tier);
          formData.append('genre', genre);
          formData.append('user_id', userId);
          formData.append('is_preview', 'false');

          console.log('Uploading file directly to Python for mastering (prod)...');
          // Trailing slash helps on some Nginx prefix-strip configs
          const resp = await axios.post(`${this.baseURL}/upload-file/`, formData, { timeout: 300000 });
          const masteredUrl: string = resp.data?.mastered_url || resp.data?.url;
          if (!masteredUrl) {
            throw new Error('Python service did not return mastered_url');
          }
          const lower = masteredUrl.toLowerCase();
          const resolvedFormat = lower.endsWith('.wav') ? 'WAV' : lower.endsWith('.mp3') ? 'MP3' : (format.toUpperCase());
          return {
            status: 'done',
            url: masteredUrl,
            lufs: -8,
            format: resolvedFormat,
            duration: 0,
            processing_time: 0,
          } as any;
        } catch (err: any) {
          if (err?.response?.status !== 404) throw err;
          console.warn('Direct Python upload 404; falling back to Laravel upload + /master');

          const formData2 = new FormData();
          formData2.append('audio', file);
          formData2.append('tier', tier);
          formData2.append('genre', genre);
          formData2.append('user_id', userId);

          const uploadResponse = await axios.post(`/api/upload-audio`, formData2);
          const { file_url } = uploadResponse.data;

          const masteringRequest: MasteringRequest = {
            user_id: userId,
            tier: tier.charAt(0).toUpperCase() + tier.slice(1) as any,
            genre: genre as any,
            target_format: (format.toUpperCase()) as any,
            target_sample_rate: 44100 as any,
            file_url,
            target_lufs: -14.0,
          };
          return await this.processAudio(masteringRequest);
        }
      }
    } catch (error: any) {
      console.error('Upload and process failed:', error);
      throw error;
    }
  }

  /**
   * Get real-time preview of genre effects (for real-time player)
   */
  async getGenrePreview(genre: string, tier: string): Promise<GenreInfo> {
    try {
      const genreInfo = await this.getGenreInformation();
      return genreInfo[genre] || genreInfo['Pop'];
    } catch (error) {
      console.error('Failed to get genre preview:', error);
      throw new Error('Failed to get genre preview');
    }
  }

  /**
   * Fetch ML "industry presets" for key genres from backend
   */
  async getIndustryPresets(): Promise<Record<string, GenreInfo>> {
    try {
      if (this.presetsCache) {
        return this.presetsCache;
      }
      const response = await axios.get(`${this.baseURL}/genre-presets`);
      this.presetsCache = response.data.presets as Record<string, GenreInfo>;
      return this.presetsCache;
    } catch (error) {
      // Fallback: build presets from /genres (case-insensitive matching)
      try {
        const genres = await this.getGenreInformation();
        const presets: Record<string, GenreInfo> = {};

        const findGenre = (name: string): GenreInfo | undefined => {
          const key = Object.keys(genres).find(
            k => k.toLowerCase() === name.toLowerCase()
          );
          return key ? genres[key] : undefined;
        };

        const hipHop = findGenre('Hip-Hop') || {
          eq_curve: {
            low_shelf: { freq: 80, gain: 3 },
            low_mid: { freq: 250, gain: -1 },
            mid: { freq: 1000, gain: 0 },
            high_mid: { freq: 3500, gain: 1 },
            high_shelf: { freq: 10000, gain: 2 },
          },
          compression: { ratio: 3, threshold: -18, attack: 10, release: 120 },
          stereo_width: 0.1,
          target_lufs: -9,
        };

        const afrobeats = findGenre('Afrobeats') || {
          eq_curve: {
            low_shelf: { freq: 90, gain: 2 },
            low_mid: { freq: 300, gain: 0 },
            mid: { freq: 1200, gain: 0.5 },
            high_mid: { freq: 4000, gain: 1.5 },
            high_shelf: { freq: 12000, gain: 2 },
          },
          compression: { ratio: 2.5, threshold: -16, attack: 12, release: 140 },
          stereo_width: 0.15,
          target_lufs: -10,
        };

        presets['Hip-Hop'] = hipHop;
        presets['Afrobeats'] = afrobeats;
        this.presetsCache = presets;
        return this.presetsCache;
      } catch (fallbackError) {
        // As a last resort, return minimal defaults for the two free genres
        this.presetsCache = {
          'Hip-Hop': {
            eq_curve: {
              low_shelf: { freq: 80, gain: 3 },
              low_mid: { freq: 250, gain: -1 },
              mid: { freq: 1000, gain: 0 },
              high_mid: { freq: 3500, gain: 1 },
              high_shelf: { freq: 10000, gain: 2 },
            },
            compression: { ratio: 3, threshold: -18, attack: 10, release: 120 },
            stereo_width: 0.1,
            target_lufs: -9,
          },
          'Afrobeats': {
            eq_curve: {
              low_shelf: { freq: 90, gain: 2 },
              low_mid: { freq: 300, gain: 0 },
              mid: { freq: 1200, gain: 0.5 },
              high_mid: { freq: 4000, gain: 1.5 },
              high_shelf: { freq: 12000, gain: 2 },
            },
            compression: { ratio: 2.5, threshold: -16, attack: 12, release: 140 },
            stereo_width: 0.15,
            target_lufs: -10,
          },
        };
        return this.presetsCache;
      }
    }
  }

  async getPresetForGenre(genre: string): Promise<GenreInfo> {
    try {
      const presets = await this.getIndustryPresets();
      // Try exact then case-insensitive fallback
      return (
        presets[genre] ||
        presets[Object.keys(presets).find(k => k.toLowerCase() === genre.toLowerCase()) || ''] ||
        (await this.getGenrePreview(genre, 'free'))
      );
    } catch {
      // Fallback if backend presets endpoint is not available yet
      return this.getGenrePreview(genre, 'free');
    }
  }

  /**
   * Generate real-time preview of genre effects on audio
   */
  async generateGenrePreview(
    file: File,
    genre: string,
    tier: 'free' | 'professional' | 'advanced' | 'one_on_one',
    userId: string
  ): Promise<{ preview_url: string; genre: string; duration: number }> {
    try {
      // Send file directly to Python service for preview
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('tier', tier);
      formData.append('genre', genre);
      formData.append('user_id', userId);
      formData.append('is_preview', 'true');

      console.log('Generating genre preview directly with Python...');
      console.log('File object:', file);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      
      const response = await axios.post(`${this.baseURL}/upload-file`, formData, {
        timeout: 60000, // 1 minute timeout for preview
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Genre preview generation failed:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request parameters for preview');
      } else if (error.response?.status === 413) {
        throw new Error('File too large for preview');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported file format for preview');
      } else if (error.response?.status === 500) {
        throw new Error('Preview generation failed on server');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Preview generation timeout');
      } else {
        throw new Error('Failed to generate preview: ' + (error.message || 'Unknown error'));
      }
    }
  }

  /**
   * Check if Python service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Python service health check failed:', error);
      return false;
    }
  }
}

export const pythonAudioService = new PythonAudioService();

