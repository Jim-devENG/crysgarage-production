import axios from 'axios';

// Types for Advanced Tier
export interface AdvancedEffects {
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    enabled: boolean;
  };
  stereo_widener: {
    width: number;
    enabled: boolean;
  };
  loudness: {
    gain: number;
    enabled: boolean;
  };
  limiter: {
    threshold: number;
    ceiling: number;
    enabled: boolean;
  };
}

export interface AdvancedMasteringRequest {
  file: File;
  genre: string;
  tier: string;
  target_lufs: number;
  effects: AdvancedEffects;
  user_id: string;
}

export interface AdvancedMasteringResponse {
  status: string;
  url: string;
  lufs: number;
  format: string;
  duration: number;
  sample_rate: number;
  file_size: number;
  processing_time: number;
  ml_summary: string;
  applied_params: AdvancedEffects;
}

class AdvancedAudioService {
  private baseURL: string;

  constructor() {
    // Determine base URL based on environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.baseURL = 'http://localhost:8002';
    } else {
      this.baseURL = 'https://crysgarage.studio';
    }
  }

  async masterAudioAdvanced(request: AdvancedMasteringRequest): Promise<AdvancedMasteringResponse> {
    try {
      console.log('🎵 Starting advanced mastering with Python backend...');
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('genre', request.genre);
      formData.append('tier', request.tier);
      formData.append('target_lufs', request.target_lufs.toString());
      formData.append('user_id', request.user_id);
      
      // Add compressor parameters
      formData.append('compressor_threshold', request.effects.compressor.threshold.toString());
      formData.append('compressor_ratio', request.effects.compressor.ratio.toString());
      formData.append('compressor_attack', request.effects.compressor.attack.toString());
      formData.append('compressor_release', request.effects.compressor.release.toString());
      formData.append('compressor_enabled', request.effects.compressor.enabled.toString());
      
      // Add stereo widener parameters
      formData.append('stereo_width', request.effects.stereo_widener.width.toString());
      formData.append('stereo_enabled', request.effects.stereo_widener.enabled.toString());
      
      // Add loudness parameters
      formData.append('loudness_gain', request.effects.loudness.gain.toString());
      formData.append('loudness_enabled', request.effects.loudness.enabled.toString());
      
      // Add limiter parameters
      formData.append('limiter_threshold', request.effects.limiter.threshold.toString());
      formData.append('limiter_ceiling', request.effects.limiter.ceiling.toString());
      formData.append('limiter_enabled', request.effects.limiter.enabled.toString());
      
      console.log('📤 Sending advanced mastering request to:', `${this.baseURL}/master-advanced`);
      console.log('🎛️ Effects configuration:', request.effects);
      
      const response = await axios.post(`${this.baseURL}/master-advanced`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Advanced mastering completed:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Advanced mastering failed:', error);
      throw new Error(`Advanced mastering failed: ${error}`);
    }
  }

  async getGenrePresets(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/genre-presets`);
      return response.data;
    } catch (error) {
      console.error('Failed to get genre presets:', error);
      throw new Error('Failed to get genre presets');
    }
  }

  async getTierInformation(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/tiers`, { headers: { 'Accept': 'application/json' } });
      const data = response.data || {};
      // Support both shapes: {free, pro, advanced} or {tiers: {...}}
      const tiers = (data && (data.free || data.pro || data.advanced)) ? data : (data.tiers || {});
      // If still empty, throw to trigger fallback
      if (!tiers || Object.keys(tiers).length === 0) {
        throw new Error('Empty tiers from backend');
      }
      return tiers;
    } catch (error) {
      console.error('Failed to get tier information:', error);
      // Fallback to static file if backend route is not yet wired
      try {
        const resp = await axios.get(`/tiers.json`, { headers: { 'Accept': 'application/json' } });
        return resp.data;
      } catch (e) {
        throw new Error('Failed to get tier information');
      }
    }
  }

  async analyzeFileAdvanced(file: File, userId: string = 'advanced-preview'): Promise<{ lufs: number; rms_db: number; peak_db: number }> {
    try {
      const form = new FormData();
      form.append('audio', file);
      form.append('user_id', userId);
      const resp = await axios.post(`${this.baseURL}/analyze-file-advanced`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = resp.data || {};
      return {
        lufs: Number(data?.metadata?.lufs ?? -14),
        rms_db: Number(data?.rms_db ?? -12),
        peak_db: Number(data?.peak_db ?? -1),
      };
    } catch (e) {
      console.error('analyzeFileAdvanced failed:', e);
      return { lufs: -14, rms_db: -12, peak_db: -1 };
    }
  }

  async analyzeUpload(file: File, userId: string = 'upload-user'): Promise<any> {
    const form = new FormData();
    form.append('audio', file);
    form.append('user_id', userId);
    const resp = await axios.post(`${this.baseURL}/analyze-upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return resp.data;
  }

  async analyzeFinal(file: File, userId: string = 'final-user'): Promise<any> {
    const form = new FormData();
    form.append('audio', file);
    form.append('user_id', userId);
    const resp = await axios.post(`${this.baseURL}/analyze-final`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return resp.data;
  }
}

export const advancedAudioService = new AdvancedAudioService();
export default advancedAudioService;
