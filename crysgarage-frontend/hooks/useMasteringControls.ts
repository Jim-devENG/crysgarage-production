import { useState, useCallback } from 'react';
import { ProcessingConfiguration } from '../services/api';

interface EQSettings {
  low: number;
  lowMid: number;
  mid: number;
  highMid: number;
  high: number;
  presence: number;
  air: number;
  sub: number;
}

interface CompressionSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  makeup: number;
}

interface MasteringControlsState {
  eqSettings: EQSettings;
  compressionSettings: CompressionSettings;
  stereoWidth: number;
  genre: string;
  sampleRate: number;
  bitDepth: number;
  targetLufs: number;
  truePeak: number;
}

interface UseMasteringControlsReturn {
  controls: MasteringControlsState;
  updateEQ: (band: keyof EQSettings, value: number) => void;
  updateCompression: (param: keyof CompressionSettings, value: number) => void;
  updateStereoWidth: (value: number) => void;
  updateGenre: (genre: string) => void;
  updateProcessingConfig: (config: Partial<ProcessingConfiguration>) => void;
  getProcessingConfiguration: () => ProcessingConfiguration;
  resetControls: () => void;
}

const defaultEQSettings: EQSettings = {
  low: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  high: 0,
  presence: 0,
  air: 0,
  sub: 0,
};

const defaultCompressionSettings: CompressionSettings = {
  threshold: -20,
  ratio: 4,
  attack: 10,
  release: 100,
  makeup: 0,
};

const defaultControls: MasteringControlsState = {
  eqSettings: defaultEQSettings,
  compressionSettings: defaultCompressionSettings,
  stereoWidth: 1.0,
  genre: 'afrobeats',
  sampleRate: 44100,
  bitDepth: 24,
  targetLufs: -14.0,
  truePeak: -1.0,
};

export const useMasteringControls = (): UseMasteringControlsReturn => {
  const [controls, setControls] = useState<MasteringControlsState>(defaultControls);

  // Update EQ settings
  const updateEQ = useCallback((band: keyof EQSettings, value: number) => {
    setControls(prev => ({
      ...prev,
      eqSettings: {
        ...prev.eqSettings,
        [band]: value,
      },
    }));
  }, []);

  // Update compression settings
  const updateCompression = useCallback((param: keyof CompressionSettings, value: number) => {
    setControls(prev => ({
      ...prev,
      compressionSettings: {
        ...prev.compressionSettings,
        [param]: value,
      },
    }));
  }, []);

  // Update stereo width
  const updateStereoWidth = useCallback((value: number) => {
    setControls(prev => ({
      ...prev,
      stereoWidth: value,
    }));
  }, []);

  // Update genre
  const updateGenre = useCallback((genre: string) => {
    setControls(prev => ({
      ...prev,
      genre,
    }));
  }, []);

  // Update processing configuration
  const updateProcessingConfig = useCallback((config: Partial<ProcessingConfiguration>) => {
    setControls(prev => ({
      ...prev,
      ...config,
    }));
  }, []);

  // Get processing configuration for API
  const getProcessingConfiguration = useCallback((): ProcessingConfiguration => {
    return {
      sample_rate: controls.sampleRate,
      bit_depth: controls.bitDepth,
      target_lufs: controls.targetLufs,
      true_peak: controls.truePeak,
      eq_settings: controls.eqSettings as unknown as Record<string, number>,
      compression_settings: controls.compressionSettings as unknown as Record<string, number>,
      stereo_width: controls.stereoWidth,
    };
  }, [controls]);

  // Reset controls to defaults
  const resetControls = useCallback(() => {
    setControls(defaultControls);
  }, []);

  return {
    controls,
    updateEQ,
    updateCompression,
    updateStereoWidth,
    updateGenre,
    updateProcessingConfig,
    getProcessingConfiguration,
    resetControls,
  };
}; 