import { useState, useCallback } from 'react';
import { mlPipelineService, MLUploadResponse, MLProcessResponse, MLRecommendations } from '../services/mlPipelineAPI';

export interface MLPipelineState {
  isProcessing: boolean;
  isUploading: boolean;
  currentStep: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error: string | null;
  uploadResult: MLUploadResponse | null;
  processResult: MLProcessResponse | null;
  recommendations: MLRecommendations | null;
}

export interface MLPipelineActions {
  processAudioFile: (
    file: File,
    tier: 'free' | 'professional' | 'advanced' | 'one_on_one',
    genre: 'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general'
  ) => Promise<void>;
  reset: () => void;
  getRecommendations: (
    tier: 'free' | 'professional' | 'advanced' | 'one_on_one',
    genre: 'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general'
  ) => Promise<MLRecommendations>;
}

export const useMLPipeline = (): MLPipelineState & MLPipelineActions => {
  const [state, setState] = useState<MLPipelineState>({
    isProcessing: false,
    isUploading: false,
    currentStep: 'idle',
    progress: 0,
    error: null,
    uploadResult: null,
    processResult: null,
    recommendations: null,
  });

  const processAudioFile = useCallback(async (
    file: File,
    tier: 'free' | 'professional' | 'advanced' | 'one_on_one',
    genre: 'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general'
  ) => {
    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        isUploading: true,
        currentStep: 'uploading',
        progress: 0,
        error: null,
        uploadResult: null,
        processResult: null,
      }));

      // Step 1: Upload
      setState(prev => ({ ...prev, progress: 25 }));
      const uploadResult = await mlPipelineService.uploadAudio({
        audio: file,
        tier,
        genre,
      });

      setState(prev => ({
        ...prev,
        uploadResult,
        isUploading: false,
        currentStep: 'processing',
        progress: 50,
      }));

      // Step 2: Process
      setState(prev => ({ ...prev, progress: 75 }));
      const processResult = await mlPipelineService.processAudio({
        audio_id: uploadResult.audio_id,
      });

      setState(prev => ({
        ...prev,
        processResult,
        isProcessing: false,
        currentStep: 'completed',
        progress: 100,
      }));

    } catch (error: any) {
      console.error('ML Pipeline error:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        isUploading: false,
        currentStep: 'error',
        error: error.message || 'An error occurred during processing',
      }));
    }
  }, []);

  const getRecommendations = useCallback(async (
    tier: 'free' | 'professional' | 'advanced' | 'one_on_one',
    genre: 'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general'
  ): Promise<MLRecommendations> => {
    try {
      const recommendations = await mlPipelineService.getMLRecommendations(tier, genre);
      setState(prev => ({ ...prev, recommendations }));
      return recommendations;
    } catch (error: any) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      isUploading: false,
      currentStep: 'idle',
      progress: 0,
      error: null,
      uploadResult: null,
      processResult: null,
      recommendations: null,
    });
  }, []);

  return {
    ...state,
    processAudioFile,
    reset,
    getRecommendations,
  };
};

export default useMLPipeline;