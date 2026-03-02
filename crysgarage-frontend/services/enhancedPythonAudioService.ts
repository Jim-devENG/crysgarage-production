/**
 * Enhanced Python Audio Service
 * Handles all supported audio formats and sample rates
 */

import axios from 'axios';
import AudioFormatService from './audioFormatService';

const isLocal = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const computePythonBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (origin.includes('crysgarage.studio')) {
      return 'https://crysgarage.studio';
    }
    return 'http://localhost:8002';
  }
  return 'http://localhost:8002';
};

const PYTHON_SERVICE_URL = computePythonBaseUrl();

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
  max_file_size_mb?: number;
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
  processed_file_size_mb?: number;
  processed_file_size_bytes?: number;
  // ML extras
  ml_summary?: Array<{ area: string; action: string; reason?: string }>;
  applied_params?: Record<string, any>;
}

export interface MasteringRequest {
  file_url: string;
  tier: string;
  genre: string;
  user_id: string;
  target_format: string;
  target_sample_rate: number;
  mp3_bitrate_kbps?: number;
  wav_bit_depth?: number;
  target_lufs?: number;
}

class EnhancedPythonAudioService {
  private baseURL: string;

  constructor() {
    this.baseURL = PYTHON_SERVICE_URL;
  }

  /**
   * Get tier information from backend
   */
  async getTierInformation(): Promise<Record<string, TierInfo>> {
    try {
      if (!this.baseURL || !this.baseURL.startsWith('http')) {
        this.baseURL = computePythonBaseUrl();
      }
      console.log('🔍 Getting tier information from:', `${this.baseURL}/tiers`);
      
      const response = await axios.get(`${this.baseURL}/tiers`, { 
        headers: { 'Accept': 'application/json' } 
      });
      console.log('🔍 Response received:', response.data);
      
      const data = response.data || {};
      const tiers = data.tiers || data; // support both shapes
      
      console.log('🔍 Processed tiers:', tiers);
      console.log('🔍 Tiers keys:', Object.keys(tiers));
      
      if (!tiers || Object.keys(tiers).length === 0) {
        console.error('🔍 Empty tiers detected');
        throw new Error('Empty tiers from backend');
      }
      
      console.log('🔍 Returning tiers successfully');
      return tiers as Record<string, TierInfo>;
    } catch (error) {
      console.error('🔍 Failed to get tier information:', error);
      // Fallback to static file to keep UI working
      try {
        console.log('🔍 Trying fallback to /tiers.json');
        const resp = await axios.get(`/tiers.json`, { 
          headers: { 'Accept': 'application/json' } 
        });
        console.log('🔍 Fallback response:', resp.data);
        return resp.data as Record<string, TierInfo>;
      } catch (e) {
        console.error('🔍 Fallback also failed:', e);
        throw new Error('Failed to get tier information from Python service');
      }
    }
  }

  /**
   * Get supported formats and sample rates
   */
  async getSupportedFormats(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/supported-formats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get supported formats:', error);
      // Fallback to local service
      const formatService = AudioFormatService.getInstance();
      return {
        formats: formatService.getSupportedFormats().map(f => f.name),
        sample_rates: formatService.getSupportedSampleRates().map(r => r.value),
        format_details: {}
      };
    }
  }

  /**
   * Upload and process audio with enhanced format support
   */
  async uploadAndProcessAudio(
    file: File,
    tier: 'free' | 'pro' | 'professional' | 'advanced' | 'one_on_one',
    genre: string,
    userId: string,
    format: string = 'MP3',
    sampleRate: number = 44100,
    targetLufs?: number
  ): Promise<MasteringResponse> {
    try {
      if (isLocal) {
        // Local dev mirrors production: direct to Python upload-file
        if (!this.baseURL || !this.baseURL.startsWith('http')) {
          this.baseURL = computePythonBaseUrl();
        }
        
        const formData = new FormData();
        formData.append('file', file);                    // Audio file to be processed
        formData.append('tier', tier);                     // Processing tier (free/professional/advanced)
        formData.append('genre', genre);                   // Audio genre for processing
        formData.append('user_id', userId);               // User identifier
        formData.append('is_preview', 'false');           // Preview mode flag
        formData.append('target_format', format.toUpperCase()); // Output format (MP3/WAV/FLAC)
        formData.append('target_sample_rate', String(sampleRate)); // Output sample rate
        
        if (typeof targetLufs === 'number') {
          formData.append('target_lufs', String(targetLufs));
        }
        
        // Set format-specific parameters
        const formatService = AudioFormatService.getInstance();
        const formatInfo = formatService.getFormatByName(format);
        
        if (formatInfo) {
          if (formatInfo.quality === 'lossy' && formatInfo.maxBitrate) {
            formData.append('mp3_bitrate_kbps', String(formatInfo.maxBitrate));
          } else if (formatInfo.name === 'WAV') {
            formData.append('wav_bit_depth', '24');
          }
        }

        console.log('Uploading file directly to Python for mastering (local)...');
        let resp;
        try {
          resp = await axios.post(`${this.baseURL}/upload-file/`, formData);
        } catch (e: any) {
          if (e?.response?.status === 404) {
            resp = await axios.post(`${this.baseURL}/upload-file`, formData);
          } else {
            throw e;
          }
        }
        
        // Robust URL extraction - check all possible field names
        const masteredUrl: string = 
          resp.data?.file_url ||
          resp.data?.mastered_url ||
          resp.data?.masteredUrl ||
          resp.data?.processedUrl ||
          resp.data?.url;
        
        if (!masteredUrl) {
          console.error('❌ No mastered file URL found in response. Available keys:', Object.keys(resp.data || {}));
          throw new Error('No mastered file URL found in response. Check backend response structure.');
        }
        
        // Log which field name was actually used
        const detectedField = Object.keys(resp.data || {}).find(k => resp.data[k] === masteredUrl);
        console.log(`✅ Mastered file URL detected from field: "${detectedField}" = ${masteredUrl}`);
        
        const lower = masteredUrl.toLowerCase();
        const isLocalUrl = lower.includes('localhost') || lower.includes('127.0.0.1');
        const isRelativeUrl = masteredUrl.startsWith('/');
        
        let finalUrl = masteredUrl;
        if (isRelativeUrl) {
          finalUrl = `${this.baseURL}${masteredUrl}`;
        } else if (isLocalUrl && !isLocal) {
          // Convert localhost URLs to production URLs
          finalUrl = masteredUrl.replace(/localhost:\d+/, 'crysgarage.studio');
        }
        
        console.log('🎵 DEBUG: Processing result:', resp.data);
        console.log('🎵 DEBUG: Processed file size bytes:', resp.data?.processed_file_size_bytes);
        
        return {
          status: 'done',
          url: finalUrl,
          lufs: resp.data?.lufs || -8,
          format: format,
          duration: resp.data?.duration || 0,
          processing_time: resp.data?.processing_time || 0,
          sample_rate: resp.data?.target_sample_rate || sampleRate,
          file_size: resp.data?.processed_file_size_bytes || 0,
          processed_file_size_mb: resp.data?.processed_file_size_mb || 0,
          processed_file_size_bytes: resp.data?.processed_file_size_bytes || 0,
        } as MasteringResponse;
      } else {
        // Production path
        const formData = new FormData();
        formData.append('file', file);                    // Audio file to be processed
        formData.append('tier', tier);                     // Processing tier (free/professional/advanced)
        formData.append('genre', genre);                   // Audio genre for processing
        formData.append('user_id', userId);               // User identifier
        formData.append('is_preview', 'false');           // Preview mode flag
        formData.append('target_format', format.toUpperCase()); // Output format (MP3/WAV/FLAC)
        formData.append('target_sample_rate', String(sampleRate)); // Output sample rate
        
        if (typeof targetLufs === 'number') {
          formData.append('target_lufs', String(targetLufs));
        }
        
        // Set format-specific parameters
        const formatService = AudioFormatService.getInstance();
        const formatInfo = formatService.getFormatByName(format);
        
        if (formatInfo) {
          if (formatInfo.quality === 'lossy' && formatInfo.maxBitrate) {
            formData.append('mp3_bitrate_kbps', String(formatInfo.maxBitrate));
          } else if (formatInfo.name === 'WAV') {
            formData.append('wav_bit_depth', '24');
          }
        }

        console.log('Uploading file directly to Python for mastering (production)...');
        const resp = await axios.post(`${this.baseURL}/upload-file`, formData);
        
        // Robust URL extraction - check all possible field names
        const masteredUrl: string = 
          resp.data?.file_url ||
          resp.data?.mastered_url ||
          resp.data?.masteredUrl ||
          resp.data?.processedUrl ||
          resp.data?.url;
        
        if (!masteredUrl) {
          console.error('❌ No mastered file URL found in response. Available keys:', Object.keys(resp.data || {}));
          throw new Error('No mastered file URL found in response. Check backend response structure.');
        }
        
        // Log which field name was actually used
        const detectedField = Object.keys(resp.data || {}).find(k => resp.data[k] === masteredUrl);
        console.log(`✅ Mastered file URL detected from field: "${detectedField}" = ${masteredUrl}`);
        
        console.log('🎵 DEBUG: Processing result:', resp.data);
        console.log('🎵 DEBUG: Processed file size bytes:', resp.data?.processed_file_size_bytes);
        
        return {
          status: 'done',
          url: masteredUrl,
          lufs: resp.data?.lufs || -8,
          format: format,
          duration: resp.data?.duration || 0,
          processing_time: resp.data?.processing_time || 0,
          sample_rate: resp.data?.target_sample_rate || sampleRate,
          file_size: resp.data?.processed_file_size_bytes || 0,
          processed_file_size_mb: resp.data?.processed_file_size_mb || 0,
          processed_file_size_bytes: resp.data?.processed_file_size_bytes || 0,
        } as MasteringResponse;
      }
    } catch (error: any) {
      console.error('Upload and process failed:', error);
      throw new Error(error.message || 'Unknown error');
    }
  }

  /**
   * Download processed audio file
   */
  async downloadProcessedAudio(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Download HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('🎵 DEBUG: Download blob size:', blob.size, 'bytes');
      
      if (blob.size < 1024) {
        console.error('🎵 DEBUG: Blob too small:', blob.size);
        throw new Error(`Downloaded file too small (${blob.size} bytes)`);
      }
      
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      
      console.log('🎵 Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
}

export default EnhancedPythonAudioService;
