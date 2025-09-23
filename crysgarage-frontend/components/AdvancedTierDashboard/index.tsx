import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileAudio, 
  Upload, 
  Music,
  Zap,
  Download,
  Settings,
  Play,
  Pause,
  Volume2,
  TrendingUp,
  CheckCircle,
  Loader2
} from 'lucide-react';
import StudioHeader from './StudioHeader';
import FileUpload from './FileUpload';

import AudioEffects from './AudioEffects';
import ExportGate from './ExportGate/index';
import ProcessingOverlay from './ProcessingOverlay';

import SimplePreviewPlayer, { SimplePreviewPlayerRef } from './SimplePreviewPlayer';
import StudioDashboard from './StudioDashboard';
import GenrePresets from './GenrePresets';
import BasicEffectsPanel from './BasicEffectsPanel';
import SpectrumVisualizer from './SpectrumVisualizer';
import RealTimeAnalysisPanel from './RealTimeAnalysisPanel';
import { GENRE_PRESETS, multiplierToDb } from './sharedGenrePresets';
import { advancedAudioService, AdvancedEffects, AdvancedMasteringRequest } from '../../services/advancedAudioService';

interface AdvancedTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

// Removed MeterData interface - using Python backend processing

const AdvancedTierDashboard: React.FC<AdvancedTierDashboardProps> = ({ 
  onFileUpload, 
  credits = 0 
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, size: number, type: string} | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const processingSteps = [
    'Uploading file',
    'Analyzing audio',
    'Applying genre EQ',
    'Compression',
    'Stereo widening',
    'Limiting',
    'Normalization (brick wall)',
    'Finalizing & saving'
  ];
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  // Removed meter data - using Python backend processing
  // Lightweight analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ lufs?: number; peak_db?: number; rms_db?: number; stereo_correlation?: number } | null>(null);


  // Audio effects state - structured for real-time processing
  const [audioEffects, setAudioEffects] = useState({
    // Free effects - enabled by default
    eq: { 
      bands: [
        { frequency: 60, gain: 0, q: 1, type: 'lowshelf' as const },
        { frequency: 150, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 2500, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 6000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 10000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 16000, gain: 0, q: 1, type: 'highshelf' as const }
      ], 
      enabled: true 
    },
    compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: true },
    stereoWidener: { width: 0, enabled: true },
          loudness: { gain: 0, enabled: true },
    limiter: { threshold: -1, ceiling: -0.1, enabled: true },
    
    // Premium effects (optional)
    gMasteringCompressor: { threshold: -20, ratio: 4, attack: 10, release: 100, makeup: 0, reduction: 0, outputLevel: -20, enabled: false },
    gPrecisionEQ: { 
      bands: [
        { frequency: 60, gain: 0, q: 1, type: 'lowshelf' as const },
        { frequency: 150, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 2500, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 6000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 10000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 16000, gain: 0, q: 1, type: 'highshelf' as const }
      ], 
      enabled: false 
    },
    gDigitalTape: { saturation: 0, warmth: 0, compression: 0, enabled: false },
    gLimiter: { threshold: -1, inputGain: 0, outputGain: 0, reduction: 0, outputPeak: -20, enabled: false },
    gMultiBand: { 
      low: { threshold: -20, ratio: 4 }, 
      mid: { threshold: -20, ratio: 4 }, 
      high: { threshold: -20, ratio: 4 }, 
      enabled: false 
    },
    
    // Advanced features
    gSurround: { width: 0, depth: 0, enabled: false },
    gTuner: { enabled: false, frequency: 450, cents: 16 }
  });

  const [surroundEnabled, setSurroundEnabled] = useState(false);
  const [tunerEnabled, setTunerEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Track manual adjustments to prevent unwanted resets
  const [manualAdjustments, setManualAdjustments] = useState<Set<string>>(new Set());
  
  // Store backup of effect states before genre presets
  const [effectStateBackup, setEffectStateBackup] = useState<Record<string, any>>({});
  
  // Store original effect values before any genre preset
  const [originalEffectValues, setOriginalEffectValues] = useState<Record<string, any>>({});
  
  // Genre lock system
  const [genreLocked, setGenreLocked] = useState(false);
  const [lockedGenrePreset, setLockedGenrePreset] = useState<any>(null);
  const [lockedEffectValues, setLockedEffectValues] = useState<Record<string, any>>({});

  // Meter settings and auto-adjustment
  const [meterSettings, setMeterSettings] = useState({
    lufsTarget: -14,
    peakTarget: -1,
    rmsTarget: -12,
    correlationTarget: 0.8
  });

  const [autoAdjust, setAutoAdjust] = useState({
    lufs: false,
    peak: false,
    rms: false,
    correlation: false
  });

  // Real-time feedback state




  // Refs for real-time analysis
  const simplePreviewPlayerRef = useRef<SimplePreviewPlayerRef>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (processedAudioUrl) {
        URL.revokeObjectURL(processedAudioUrl);
      }
    };
  }, [processedAudioUrl]);

  // Cleanup feedback timer on unmount


  // Debug genre lock state changes
  useEffect(() => {
    console.log('Genre lock state changed:', {
      genreLocked,
      selectedGenre,
      lockedGenrePreset: lockedGenrePreset ? 'exists' : 'null',
      lockedEffectValues: Object.keys(lockedEffectValues),
      effectStateBackup: Object.keys(effectStateBackup),
      backupDetails: effectStateBackup
    });
  }, [genreLocked, selectedGenre, lockedGenrePreset, lockedEffectValues, effectStateBackup]);

  // Initialize audio context when reaching step 3 for export
  // Removed audio context initialization - using Python backend processing

  const manualInit = useCallback(() => {
    // No-op: Web Audio chain removed; Python backend handles processing
  }, []);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });
      setCurrentStep(2);
      
      // If no genre selected, set the original file for playback
      if (simplePreviewPlayerRef.current) {
        const originalUrl = URL.createObjectURL(file);
        console.log('🎵 Setting original file URL for playback:', originalUrl);
        simplePreviewPlayerRef.current.updatePreviewUrl(originalUrl);
        
        // Start playback immediately to initialize audio context
        setTimeout(() => {
          try {
            simplePreviewPlayerRef.current?.play();
            console.log('🎵 Initial playback started');
          } catch (e) {
            console.warn('Initial playback failed:', e);
          }
        }, 500);
      }

      // Kick off analysis after upload
      setAnalyzing(true);
      advancedAudioService.analyzeUpload(file).then((data) => {
        setAnalysis({
          lufs: data?.metadata?.lufs,
          peak_db: data?.peak_db,
          rms_db: data?.rms_db,
          stereo_correlation: data?.stereo_correlation,
        });
      }).catch((e) => {
        console.warn('analyzeUpload failed:', e);
      }).finally(() => setAnalyzing(false));
    }
  };

  // Removed handleMeterUpdate - using Python backend processing

  // Handle feedback timer


  // Handle effect changes and track manual adjustments
  const handleEffectChange = (effects: any) => {
    // Track manual adjustments when effects are changed
    if (selectedGenre) {
      const newManualAdjustments = new Set(manualAdjustments);
      
      // Check if effects have been manually adjusted from the genre preset
      if (lockedEffectValues.eq && effects.eq.bands && (
        effects.eq.bands[0]?.gain !== lockedEffectValues.eq.bands?.[0]?.gain ||
        effects.eq.bands[1]?.gain !== lockedEffectValues.eq.bands?.[1]?.gain ||
        effects.eq.bands[2]?.gain !== lockedEffectValues.eq.bands?.[2]?.gain ||
        effects.eq.bands[3]?.gain !== lockedEffectValues.eq.bands?.[3]?.gain ||
        effects.eq.bands[4]?.gain !== lockedEffectValues.eq.bands?.[4]?.gain ||
        effects.eq.bands[5]?.gain !== lockedEffectValues.eq.bands?.[5]?.gain ||
        effects.eq.bands[6]?.gain !== lockedEffectValues.eq.bands?.[6]?.gain ||
        effects.eq.bands[7]?.gain !== lockedEffectValues.eq.bands?.[7]?.gain
      )) {
        newManualAdjustments.add('eq');
      }
      
      if (lockedEffectValues.compressor && (
        effects.compressor.threshold !== lockedEffectValues.compressor.threshold ||
        effects.compressor.ratio !== lockedEffectValues.compressor.ratio ||
        effects.compressor.attack !== lockedEffectValues.compressor.attack ||
        effects.compressor.release !== lockedEffectValues.compressor.release
      )) {
        newManualAdjustments.add('compressor');
      }
      
      if (lockedEffectValues.loudness && (
        effects.loudness.gain !== lockedEffectValues.loudness.gain
      )) {
        newManualAdjustments.add('loudness');
      }
      
                if (lockedEffectValues.limiter && (
            effects.limiter.ceiling !== lockedEffectValues.limiter.ceiling
          )) {
            newManualAdjustments.add('limiter');
          }
          
          if (lockedEffectValues.gDigitalTape && (
            effects.gDigitalTape.saturation !== lockedEffectValues.gDigitalTape.saturation
          )) {
            newManualAdjustments.add('gDigitalTape');
          }
          
                if (lockedEffectValues.gMultiBand && (
        effects.gMultiBand.low?.threshold !== lockedEffectValues.gMultiBand.low?.threshold ||
        effects.gMultiBand.low?.ratio !== lockedEffectValues.gMultiBand.low?.ratio ||
        effects.gMultiBand.mid?.threshold !== lockedEffectValues.gMultiBand.mid?.threshold ||
        effects.gMultiBand.mid?.ratio !== lockedEffectValues.gMultiBand.mid?.ratio ||
        effects.gMultiBand.high?.threshold !== lockedEffectValues.gMultiBand.high?.threshold ||
        effects.gMultiBand.high?.ratio !== lockedEffectValues.gMultiBand.high?.ratio
      )) {
        newManualAdjustments.add('gMultiBand');
      }
      
      setManualAdjustments(newManualAdjustments);
    }
    
    setAudioEffects(effects);
  };

  // Continue to mastering
  const handleContinueToMastering = () => {
    if (selectedFile) {
      setCurrentStep(2);
    }
  };

  // Intelligent Optimization Engine
  const getIntelligentOptimizations = () => {
    if (!selectedGenre) return null;

    // Professional Dashboard genre presets (real industry standards)
    const professionalPresets = {
      trap: { targetLufs: -7.2, truePeak: -0.1, gain: 2.8 },
      'hip-hop': { targetLufs: -8.0, truePeak: -0.2, gain: 2.0 },
      afrobeats: { targetLufs: -7.0, truePeak: -0.1, gain: 2.2 },
      drill: { targetLufs: -7.5, truePeak: -0.15, gain: 2.5 },
      dubstep: { targetLufs: -7.0, truePeak: -0.1, gain: 3.2 },
      gospel: { targetLufs: -8.5, truePeak: -0.3, gain: 1.8 },
      'r-b': { targetLufs: -8.8, truePeak: -0.35, gain: 1.6 },
      'lofi-hiphop': { targetLufs: -9.0, truePeak: -0.4, gain: 1.2 },
      'crysgarage': { targetLufs: -7.8, truePeak: -0.15, gain: 2.4 },
      house: { targetLufs: -8.0, truePeak: -0.2, gain: 2.2 },
      techno: { targetLufs: -7.5, truePeak: -0.15, gain: 2.8 },
      highlife: { targetLufs: -8.2, truePeak: -0.25, gain: 1.9 },
      instrumentals: { targetLufs: -8.5, truePeak: -0.3, gain: 1.6 },
      beats: { targetLufs: -8.0, truePeak: -0.2, gain: 2.0 },
      amapiano: { targetLufs: -8.0, truePeak: -0.2, gain: 2.0 },
      trance: { targetLufs: -7.8, truePeak: -0.15, gain: 2.2 },
      'drum-bass': { targetLufs: -7.0, truePeak: -0.1, gain: 3.0 },
      reggae: { targetLufs: -8.2, truePeak: -0.25, gain: 1.8 },
      'voice-over': { targetLufs: -9.2, truePeak: -0.4, gain: 1.4 },
      journalist: { targetLufs: -9.5, truePeak: -0.45, gain: 1.2 },
      soul: { targetLufs: -8.8, truePeak: -0.35, gain: 1.6 },
      'content-creator': { targetLufs: -8.5, truePeak: -0.3, gain: 1.9 },
      pop: { targetLufs: -8.0, truePeak: -0.25, gain: 1.8 },
      jazz: { targetLufs: -9.0, truePeak: -0.4, gain: 1.4 }
    };

    const genreKey = selectedGenre.toLowerCase().replace(/\s+/g, '-');
    const preset = professionalPresets[genreKey];
    
    if (!preset) return null;

    // Removed meterData references - using Python backend processing
    const currentLufs = -14; // Default LUFS
    const currentPeak = -1.5; // Default peak
    const optimizations = [];

    // Define acceptable ranges for the genre
    const lufsRange = { min: preset.targetLufs - 1, max: preset.targetLufs + 1 };
    const peakRange = { min: preset.truePeak - 0.1, max: preset.truePeak + 0.1 };

    // Generate optimization recommendations only if outside acceptable range
    if (currentLufs < lufsRange.min || currentLufs > lufsRange.max) {
      const lufsDiff = preset.targetLufs - currentLufs;
      optimizations.push({
        type: 'loudness',
        adjustment: lufsDiff,
        description: `Adjust loudness by ${lufsDiff > 0 ? '+' : ''}${lufsDiff.toFixed(1)} dB to reach ${preset.targetLufs} dB target`
      });
    }

    if (currentPeak < peakRange.min || currentPeak > peakRange.max) {
      const peakDiff = preset.truePeak - currentPeak;
      optimizations.push({
        type: 'limiter',
        adjustment: peakDiff,
        description: `Adjust limiter threshold to ${preset.truePeak} dBTP for optimal dynamics`
      });
    }

    return {
      optimizations,
      preset,
      currentValues: { lufs: currentLufs, peak: currentPeak },
      targetValues: { lufs: preset.targetLufs, peak: preset.truePeak }
    };
  };

  // Get genre-specific recommendations
  const getGenreRecommendations = (genreKey: string) => {
    const recommendations = [];
    
    // Base recommendations for all genres
    recommendations.push({
      title: "Loudness Target",
      description: "Aim for the target LUFS value for streaming platform compatibility",
      parameters: "Use Loudness control to reach target"
    });
    
    recommendations.push({
      title: "Peak Limiting",
      description: "Prevent clipping while maintaining dynamics",
      parameters: "Set limiter ceiling to target True Peak"
    });
    
    // Genre-specific recommendations
    if (genreKey.includes('trap') || genreKey.includes('dubstep') || genreKey.includes('drum-bass')) {
      recommendations.push({
        title: "Heavy Compression",
        description: "Apply aggressive compression for energy and impact",
        parameters: "Compressor: -15dB threshold, 3:1 ratio"
      });
      recommendations.push({
        title: "Low End Boost",
        description: "Enhance bass frequencies for club systems",
        parameters: "EQ: +2dB at 60Hz, +1.5dB at 150Hz"
      });
    } else if (genreKey.includes('jazz') || genreKey.includes('voice-over')) {
      recommendations.push({
        title: "Preserve Dynamics",
        description: "Maintain natural dynamic range",
        parameters: "Light compression: -25dB threshold, 2:1 ratio"
      });
      recommendations.push({
        title: "Warm Midrange",
        description: "Add warmth to vocals and instruments",
        parameters: "EQ: +0.5dB at 400Hz, +0.5dB at 6kHz"
      });
    } else if (genreKey.includes('gospel') || genreKey.includes('soul')) {
      recommendations.push({
        title: "Rich Warmth",
        description: "Create warm, full-bodied sound",
        parameters: "EQ: +1dB at 150Hz, +0.5dB at 1kHz, +0.5dB at 10kHz"
      });
    } else if (genreKey.includes('house') || genreKey.includes('techno')) {
      recommendations.push({
        title: "Stereo Width",
        description: "Enhance stereo image for club playback",
        parameters: "Stereo Widener: +15% width"
      });
    } else if (genreKey.includes('voice-over') || genreKey.includes('journalist')) {
      recommendations.push({
        title: "Mono Compatibility",
        description: "Ensure clear speech in mono systems",
        parameters: "Keep stereo width at 0%"
      });
    }
    
    return recommendations;
  };

  // Apply intelligent optimizations
  const applyIntelligentOptimizations = () => {
    const optimizationData = getIntelligentOptimizations();
    if (!optimizationData) {
      showToastNotification('No optimization data available for selected genre', 'error');
      return;
    }

    const { optimizations, preset } = optimizationData;
    const newEffects = { ...audioEffects };

    // Apply optimizations
    optimizations.forEach(opt => {
      switch (opt.type) {
        case 'loudness':
          newEffects.loudness.gain = Math.max(-12, Math.min(12, opt.adjustment));
          break;
        case 'limiter':
          newEffects.limiter.ceiling = Math.max(-1, Math.min(-0.1, preset.truePeak));
          break;
      }
    });

    // Apply genre-specific optimizations
    const genreKey = selectedGenre.toLowerCase().replace(/\s+/g, '-');
    
    // EQ adjustments based on genre
    if (genreKey.includes('trap') || genreKey.includes('dubstep') || genreKey.includes('drum-bass')) {
      // Boost low end for energy
      newEffects.eq.bands[0].gain = 2; // 60Hz
      newEffects.eq.bands[1].gain = 1.5; // 150Hz
      newEffects.eq.bands[6].gain = 1; // 10kHz for air
    } else if (genreKey.includes('jazz') || genreKey.includes('voice-over')) {
      // Preserve dynamics, gentle EQ
      newEffects.eq.bands[2].gain = 0.5; // 400Hz warmth
      newEffects.eq.bands[5].gain = 0.5; // 6kHz presence
    } else if (genreKey.includes('gospel') || genreKey.includes('soul')) {
      // Warm, rich sound
      newEffects.eq.bands[1].gain = 1; // 150Hz warmth
      newEffects.eq.bands[3].gain = 0.5; // 1kHz presence
      newEffects.eq.bands[6].gain = 0.5; // 10kHz air
    }

    // Compression adjustments
    if (genreKey.includes('trap') || genreKey.includes('dubstep')) {
      newEffects.compressor.threshold = -15;
      newEffects.compressor.ratio = 3;
    } else if (genreKey.includes('jazz') || genreKey.includes('voice-over')) {
      newEffects.compressor.threshold = -25;
      newEffects.compressor.ratio = 2;
    }

    // Stereo width adjustments
    if (genreKey.includes('house') || genreKey.includes('techno')) {
      newEffects.stereoWidener.width = 15;
    } else if (genreKey.includes('voice-over') || genreKey.includes('journalist')) {
      newEffects.stereoWidener.width = 0; // Keep mono
    }

    // Update effects
    setAudioEffects(newEffects);
    
    // Show success message
    showToastNotification(`Applied ${optimizations.length} optimizations for ${selectedGenre} genre`, 'success');

    // Track that these are Crysgarage Mastering Engine optimizations
    const newManualAdjustments = new Set(manualAdjustments);
    optimizations.forEach(opt => {
      newManualAdjustments.add(opt.type);
    });
    setManualAdjustments(newManualAdjustments);
  };



  // Real-time preview with Python backend
  const handleRealTimePreview = async () => {
    if (selectedFile && selectedGenre) {
      try {
        console.log('🎵 Starting real-time Python preview...');
        
        // Convert audioEffects to AdvancedEffects format
        const advancedEffects: AdvancedEffects = {
          compressor: {
            threshold: audioEffects.compressor.threshold,
            ratio: audioEffects.compressor.ratio,
            attack: audioEffects.compressor.attack / 1000, // Convert ms to seconds
            release: audioEffects.compressor.release / 1000, // Convert ms to seconds
            enabled: audioEffects.compressor.enabled
          },
          stereo_widener: {
            width: audioEffects.stereoWidener.width / 100, // Convert percentage to multiplier
            enabled: audioEffects.stereoWidener.enabled
          },
          loudness: {
            gain: audioEffects.loudness.gain,
            enabled: audioEffects.loudness.enabled
          },
          limiter: {
            threshold: audioEffects.limiter.threshold,
            ceiling: audioEffects.limiter.ceiling,
            enabled: audioEffects.limiter.enabled
          }
        };
        
        // Create preview request
        const previewRequest: AdvancedMasteringRequest = {
          file: selectedFile,
          genre: selectedGenre,
          tier: 'advanced',
          target_lufs: -8.0, // Default target LUFS
          effects: advancedEffects,
          user_id: 'advanced-preview'
        };
        
        console.log('📤 Sending real-time preview request:', previewRequest);
        
        // Process with Python backend for preview
        const result = await advancedAudioService.masterAudioAdvanced(previewRequest);
        
        console.log('✅ Real-time preview completed:', result);
        
        // Update the preview audio URL
        if (simplePreviewPlayerRef.current) {
          console.log('🎵 Updating player with new URL:', result.url);
          simplePreviewPlayerRef.current.updatePreviewUrl(result.url);
        } else {
          console.warn('⚠️ SimplePreviewPlayer ref is null, cannot update preview URL');
          // Try to initialize the player first
          setTimeout(() => {
            if (simplePreviewPlayerRef.current) {
              console.log('🎵 Player ref now available, updating URL');
              simplePreviewPlayerRef.current.updatePreviewUrl(result.url);
            } else {
              console.error('❌ Player ref still null after timeout');
            }
          }, 1000);
        }
        
      } catch (error) {
        console.error('❌ Real-time preview failed:', error);
        showToastNotification('Real-time preview failed. Python backend must succeed.', 'error');
        // No fallback: enforce Python-only preview
      }
    } else {
      console.warn('⚠️ Cannot start real-time preview: missing file or genre', {
        hasFile: !!selectedFile,
        hasGenre: !!selectedGenre
      });
    }
  };

  // Continue to export with Python processing
  const handleContinueToExport = async () => {
    if (selectedFile) {
      setIsProcessing(true);
      setProcessingStep(0);
      try {
        console.log('🎵 Starting Python-based advanced mastering...');
        
        // Convert audioEffects to AdvancedEffects format
        const advancedEffects: AdvancedEffects = {
          compressor: {
            threshold: audioEffects.compressor.threshold,
            ratio: audioEffects.compressor.ratio,
            attack: audioEffects.compressor.attack / 1000, // Convert ms to seconds
            release: audioEffects.compressor.release / 1000, // Convert ms to seconds
            enabled: audioEffects.compressor.enabled
          },
          stereo_widener: {
            width: audioEffects.stereoWidener.width / 100, // Convert percentage to multiplier
            enabled: audioEffects.stereoWidener.enabled
          },
          loudness: {
            gain: audioEffects.loudness.gain,
            enabled: audioEffects.loudness.enabled
          },
          limiter: {
            threshold: audioEffects.limiter.threshold,
            ceiling: audioEffects.limiter.ceiling,
            enabled: audioEffects.limiter.enabled
          }
        };
        
        // Create mastering request
        const masteringRequest: AdvancedMasteringRequest = {
          file: selectedFile,
          genre: selectedGenre,
          tier: 'advanced',
          target_lufs: -8.0, // Default target LUFS
          effects: advancedEffects,
          user_id: 'advanced-user'
        };
        
        console.log('📤 Sending advanced mastering request:', masteringRequest);
        
        // Process with Python backend
        // Simulate step advancement while awaiting backend
        const stepTimer = setInterval(() => {
          setProcessingStep(prev => (prev < processingSteps.length - 1 ? prev + 1 : prev));
        }, 900);

        const result = await advancedAudioService.masterAudioAdvanced(masteringRequest);
        clearInterval(stepTimer);
        setProcessingStep(processingSteps.length - 1);
        
        console.log('✅ Advanced mastering completed:', result);
        
        // Set the processed audio URL
        setProcessedAudioUrl(result.url);
        setCurrentStep(3);
        
      } catch (error) {
        console.error('❌ Advanced mastering failed:', error);
        showToastNotification('Advanced mastering failed. Python backend must succeed.', 'error');
        // No fallback: enforce Python-only output
      } finally {
        setTimeout(() => setIsProcessing(false), 600);
      }
    }
  };

  // Effect update handlers
  const handleUpdateEffectSettings = (effectType: string, settings: any) => {
    // Handle meter settings updates
    if (effectType === 'meterSettings') {
      setMeterSettings(prev => ({
        ...prev,
        ...settings
      }));
      return;
    }

    // Handle auto-adjustment updates
    if (effectType === 'autoAdjust') {
      setAutoAdjust(prev => ({
        ...prev,
        ...settings
      }));
      return;
    }

    // Track that this effect has been manually adjusted
    setManualAdjustments(prev => new Set(prev).add(effectType));
    
    
    
    console.log(`🎛️ Updating effect: ${effectType}`, settings);
    
    setAudioEffects(prev => {
      const updatedEffects = {
      ...prev,
      [effectType]: { ...prev[effectType as keyof typeof prev], ...settings }
      };
      console.log(`🎛️ New audio effects state:`, updatedEffects[effectType]);
      // Apply instantly in the browser via Web Audio API
      try {
        simplePreviewPlayerRef.current?.applyEffects(updatedEffects);
      } catch (e) {
        console.warn('applyEffects (on change) failed:', e);
      }
      
        // Remove Python preview; Web Audio API handles instant preview
      
      return updatedEffects;
    });
  };

  const handleToggleEffect = (effectType: string, enabled: boolean) => {
    console.log(`Toggling ${effectType} to ${enabled}`, {
      genreLocked,
      lockedGenrePreset: lockedGenrePreset ? 'exists' : 'null',
      lockedEffectValues: Object.keys(lockedEffectValues),
      hasLockedValue: !!lockedEffectValues[effectType],
      effectStateBackup: Object.keys(effectStateBackup)
    });
    
    setAudioEffects(prev => {
      const currentEffect = prev[effectType as keyof typeof prev];
      if (currentEffect) {
        if (enabled) {
          // When enabling an effect
          if (genreLocked && lockedEffectValues[effectType]) {
            // If genre is locked, ALWAYS restore the locked effect values
            console.log(`Restoring locked values for ${effectType}:`, lockedEffectValues[effectType]);
            return {
              ...prev,
              [effectType]: { ...lockedEffectValues[effectType], enabled: true }
            };
          } else if (effectStateBackup[effectType]) {
            // If genre is not locked, restore from backup if available
            console.log(`Restoring backup values for ${effectType}:`, effectStateBackup[effectType]);
            return {
              ...prev,
              [effectType]: { ...effectStateBackup[effectType], enabled: true }
            };
          } else {
            // Just enable with current settings
            console.log(`Enabling ${effectType} with current settings`);
            return {
              ...prev,
              [effectType]: { ...currentEffect, enabled: true }
            };
          }
        } else {
          // When disabling an effect, store the ORIGINAL genre preset values if genre is locked
          if (genreLocked && lockedEffectValues[effectType]) {
            // Store the locked genre preset values, not the current state
            console.log(`Storing locked genre values for ${effectType}:`, lockedEffectValues[effectType]);
            setEffectStateBackup(prevBackup => ({
              ...prevBackup,
              [effectType]: { ...lockedEffectValues[effectType] }
            }));
          } else {
            // Store current state only if genre is not locked
            console.log(`Storing current backup for ${effectType}:`, currentEffect);
            setEffectStateBackup(prevBackup => ({
              ...prevBackup,
              [effectType]: { ...currentEffect }
            }));
          }
          return {
            ...prev,
            [effectType]: { ...currentEffect, enabled: false }
          };
        }
      }
      return prev;
    });
  };

  const handleTogglePremiumEffect = (effectType: string, enabled: boolean) => {
    setAudioEffects(prev => {
      const currentEffect = prev[effectType as keyof typeof prev];
      if (currentEffect) {
        if (enabled) {
          // For premium effects, restore from backup if available
          if (effectStateBackup[effectType]) {
            return {
              ...prev,
              [effectType]: { ...effectStateBackup[effectType], enabled: true }
            };
          } else {
            return {
              ...prev,
              [effectType]: { ...currentEffect, enabled: true }
            };
          }
        } else {
          // When disabling, store current state
          setEffectStateBackup(prevBackup => ({
            ...prevBackup,
            [effectType]: { ...currentEffect }
          }));
          return {
            ...prev,
            [effectType]: { ...currentEffect, enabled: false }
          };
        }
      }
      return prev;
    });
  };

  // Genre selection - always apply genre preset and allow manual adjustments
  const handleGenreSelect = async (genreId: string) => {
    // Normalize to canonical genre id used by presets
    const resolveGenreId = (g: string): string => {
      const gl = (g || '').trim().toLowerCase();
      if (gl === 'afrobeats' || gl === 'afro beats' || gl === 'afro') return 'Afrobeats';
      if (gl === 'naija pop' || gl === 'naijapop' || gl === 'naija') return 'Naija Pop';
      if (gl === 'bongo flava' || gl === 'bongoflava' || gl === 'bongo') return 'Bongo Flava';
      if (gl === 'hip-life' || gl === 'hiplife' || gl === 'hip life') return 'Hip-life';
      if (gl === 'r-b' || gl === 'r&b' || gl === 'rnb' || gl === 'r and b') return 'R&B';
      if (gl === 'hip-hop' || gl === 'hiphop' || gl === 'hip hop') return 'Hip Hop';
      if (gl === 'drum-bass' || gl === 'drum & bass' || gl === 'dnb') return 'Drum & Bass';
      if (gl === 'voice-over' || gl === 'voice over') return 'Voice Over';
      if (gl === 'content-creator' || gl === 'content creator') return 'Content Creator';
      if (gl === 'crys-garage' || gl === 'crysgarage') return 'CrysGarage';
      return g;
    };
    const canonicalId = resolveGenreId(genreId);
    setSelectedGenre(canonicalId);
    
    try {
      const fallbackPreset = GENRE_PRESETS[canonicalId];
      if (fallbackPreset) {
        console.log(`🎵 Applying ${genreId} preset (TSX local):`, fallbackPreset);
        setLockedGenrePreset(fallbackPreset);
        const lockedValues = {
          eq: {
            bands: [
              { frequency: 60, gain: multiplierToDb(fallbackPreset.eq.low), q: 1, type: 'lowshelf' as const },
              { frequency: 150, gain: multiplierToDb(fallbackPreset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 400, gain: multiplierToDb(fallbackPreset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 1000, gain: multiplierToDb(fallbackPreset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 2500, gain: multiplierToDb(fallbackPreset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 6000, gain: multiplierToDb(fallbackPreset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 10000, gain: multiplierToDb(fallbackPreset.eq.high), q: 1, type: 'peaking' as const },
              { frequency: 16000, gain: multiplierToDb(fallbackPreset.eq.high), q: 1, type: 'highshelf' as const }
            ]
          },
          compressor: {
            threshold: fallbackPreset.compression.threshold,
            ratio: fallbackPreset.compression.ratio,
            attack: fallbackPreset.compression.attack,
            release: fallbackPreset.compression.release
          },
          loudness: {
            gain: multiplierToDb(fallbackPreset.gain)
          },
          limiter: {
            threshold: -3.0,
            ceiling: fallbackPreset.truePeak
          }
        };
        setLockedEffectValues(lockedValues);
      } else {
        console.warn(`⚠️ No preset found for genre: ${genreId}`);
      }

      console.log(`Genre selected: ${canonicalId}`, {
        preset: GENRE_PRESETS[canonicalId],
        genreLocked
      });

      setAudioEffects(prev => {
        const backup = {
          eq: { ...prev.eq },
          compressor: { ...prev.compressor },
          loudness: { ...prev.loudness },
          limiter: { ...prev.limiter }
        };
        setEffectStateBackup(backup);
        const currentPreset = GENRE_PRESETS[canonicalId];
        if (currentPreset) {
          const previewGainDb2 = multiplierToDb(currentPreset.gain || 1);
          return {
            ...prev,
            eq: {
              ...prev.eq,
              bands: [
                { frequency: 60, gain: multiplierToDb(currentPreset.eq?.low || 1), q: 1, type: 'lowshelf' as const },
                { frequency: 150, gain: multiplierToDb(currentPreset.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 400, gain: multiplierToDb(currentPreset.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 1000, gain: multiplierToDb(currentPreset.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 2500, gain: multiplierToDb(currentPreset.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 6000, gain: multiplierToDb(currentPreset.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 10000, gain: multiplierToDb(currentPreset.eq?.high || 1), q: 1, type: 'peaking' as const },
                { frequency: 16000, gain: multiplierToDb(currentPreset.eq?.high || 1), q: 1, type: 'highshelf' as const }
              ],
              enabled: true
            },
            compressor: {
              ...prev.compressor,
              threshold: currentPreset.compression?.threshold || -16.0,
              ratio: currentPreset.compression?.ratio || 3.0,
              attack: currentPreset.compression?.attack ?? 2,
              release: currentPreset.compression?.release ?? 150,
              enabled: true
            },
            loudness: {
              ...prev.loudness,
              gain: previewGainDb2,
              enabled: true
            },
            limiter: {
              ...prev.limiter,
              threshold: -3.0,
              ceiling: currentPreset.truePeak || -0.1,
              enabled: true
            }
          };
        }
        return prev;
      });

      try {
        const presetToUse: any = GENRE_PRESETS[canonicalId];
        if (presetToUse) {
          const effectsForApply = {
            eq: {
              bands: [
                { frequency: 60, gain: multiplierToDb(presetToUse.eq?.low || 1), q: 1, type: 'lowshelf' as const },
                { frequency: 150, gain: multiplierToDb(presetToUse.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 400, gain: multiplierToDb(presetToUse.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 1000, gain: multiplierToDb(presetToUse.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 2500, gain: multiplierToDb(presetToUse.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 6000, gain: multiplierToDb(presetToUse.eq?.mid || 1), q: 1, type: 'peaking' as const },
                { frequency: 10000, gain: multiplierToDb(presetToUse.eq?.high || 1), q: 1, type: 'peaking' as const },
                { frequency: 16000, gain: multiplierToDb(presetToUse.eq?.high || 1), q: 1, type: 'highshelf' as const }
              ]
            },
            compressor: {
              threshold: presetToUse.compression?.threshold || -16.0,
              ratio: presetToUse.compression?.ratio || 3.0,
              attack: presetToUse.compression?.attack ?? 2,
              release: presetToUse.compression?.release ?? 150,
              enabled: true
            },
            loudness: { gain: multiplierToDb(presetToUse.gain || 1), enabled: true },
            limiter: { threshold: -3.0, ceiling: presetToUse.truePeak ?? -0.1, enabled: true }
          };
          console.log('🎵 Applying genre effects:', effectsForApply);
          simplePreviewPlayerRef.current?.applyEffects(effectsForApply as any);
          
          // Force playback to ensure genre changes are heard immediately
          setTimeout(() => {
            try {
              simplePreviewPlayerRef.current?.play();
              console.log('🎵 Genre effects applied and playback started');
            } catch (e) {
              console.warn('Genre auto-play failed:', e);
            }
          }, 100);
        }
      } catch (e) {
        console.warn('applyEffects (on genre select) failed:', e);
      }

      setManualAdjustments(new Set());

    } catch (error) {
      console.error('Failed to apply local preset:', error);
    }
  };

  // Show toast notification
  const showToastNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Genre lock toggle
  const handleToggleGenreLock = () => {
    if (selectedGenre && lockedGenrePreset) {
      setGenreLocked(!genreLocked);
      console.log(`Genre lock ${!genreLocked ? 'enabled' : 'disabled'} for ${selectedGenre}`, {
        genreLocked: !genreLocked,
        lockedGenrePreset,
        lockedEffectValues,
        effectStateBackup
      });
      showToastNotification(
        `Genre lock ${!genreLocked ? 'enabled' : 'disabled'} for ${selectedGenre}`,
        'success'
      );
    } else {
      showToastNotification('Please select a genre first', 'error');
    }
  };

  // New session handler
  const handleNewSession = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setFileInfo(null);
    setProcessedAudioUrl(null);
    setIsProcessing(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVolume(1);
    setSelectedGenre('');
    // Removed setMeterData - using Python backend processing

    setAudioEffects({
      eq: { 
        bands: [
          { frequency: 60, gain: 0, q: 1, type: 'lowshelf' as const },
          { frequency: 150, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 2500, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 6000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 10000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 16000, gain: 0, q: 1, type: 'highshelf' as const }
        ], 
        enabled: true 
      },
      compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: true },
      stereoWidener: { width: 0, enabled: true },
      loudness: { gain: 0, enabled: true },
      limiter: { threshold: -1, ceiling: -0.1, enabled: true },
      gMasteringCompressor: { threshold: -20, ratio: 4, attack: 10, release: 100, makeup: 0, reduction: 0, outputLevel: -20, enabled: false },
      gPrecisionEQ: { 
        bands: [
          { frequency: 60, gain: 0, q: 1, type: 'lowshelf' as const },
          { frequency: 150, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 2500, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 6000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 10000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 16000, gain: 0, q: 1, type: 'highshelf' as const }
        ], 
        enabled: false 
      },
      gDigitalTape: { saturation: 0, warmth: 0, compression: 0, enabled: false },
      gLimiter: { threshold: -1, inputGain: 0, outputGain: 0, reduction: 0, outputPeak: -20, enabled: false },
      gMultiBand: { 
        low: { threshold: -20, ratio: 4 }, 
        mid: { threshold: -18, ratio: 4 }, 
        high: { threshold: -16, ratio: 4 }, 
        enabled: false 
      },
      gSurround: { width: 0, depth: 0, enabled: false },
      gTuner: { enabled: false, frequency: 450, cents: 16 }
    });
    // Reset meter settings and auto-adjustment
    setMeterSettings({
      lufsTarget: -14,
      peakTarget: -1,
      rmsTarget: -12,
      correlationTarget: 0.8
    });
    setAutoAdjust({
      lufs: false,
      peak: false,
      rms: false,
      correlation: false
    });
    // Reset manual adjustments tracking
    setManualAdjustments(new Set());
    // Reset effect state backup
    setEffectStateBackup({});
    // Reset genre lock system
    setGenreLocked(false);
    setLockedGenrePreset(null);
    setLockedEffectValues({});
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUpload
            selectedFile={selectedFile}
            fileInfo={fileInfo}
            onFileUpload={handleFileUpload}
            onContinue={handleContinueToMastering}
          />
        );
      
      case 2:
        return (
          <div className="space-y-4 max-w-6xl mx-auto px-4">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to File Upload</span>
              </button>
            </div>
            
            {/* Main Layout - Player and Genre */}
            <div className="grid grid-cols-1 gap-3 max-w-6xl mx-auto">
              {/* Player and Genre */}
              <div className="space-y-3">
                {/* Simple Preview Player */}
                <SimplePreviewPlayer
                  ref={simplePreviewPlayerRef}
                  audioFile={selectedFile}
                  selectedGenre={selectedGenre}
                  isProcessing={isProcessing}
                />
                {selectedFile && (
                  <div className="space-y-3">
                    <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg p-3">
                      <SpectrumVisualizer analyser={simplePreviewPlayerRef.current?.getAnalyserNode() || null} />
                    </div>
                    <RealTimeAnalysisPanel 
                      analyser={simplePreviewPlayerRef.current?.getAnalyserNode() || null}
                      isPlaying={simplePreviewPlayerRef.current?.isPlaying || false}
                    />
                  </div>
                )}
                
                {/* Genre Presets - Directly under player */}
                <GenrePresets
                  selectedGenre={selectedGenre}
                  onGenreSelect={handleGenreSelect}
                  genreLocked={genreLocked}
                  onToggleGenreLock={handleToggleGenreLock}
                />
                
               </div>
            </div>

            {/* Effects only, centered within genre width */}
            <div className="max-w-6xl mx-auto flex justify-center items-start">
              <div className="w-full">
                <BasicEffectsPanel
                effects={{
                  eq: audioEffects.eq,
                  compressor: audioEffects.compressor,
                  stereoWidener: audioEffects.stereoWidener,
                  loudness: audioEffects.loudness,
                  limiter: audioEffects.limiter,
                }}
                onChange={(next) => {
                  setAudioEffects(prev => ({ ...prev, ...next } as any));
                }}
                onApply={(next) => {
                  try {
                    const merged: any = { ...audioEffects, ...next };
                    console.log('🎛️ Applying effects to player:', merged);
                    
                    // Apply effects to the Web Audio API player
                    simplePreviewPlayerRef.current?.applyEffects({
                      eq: merged.eq,
                      compressor: {
                        threshold: merged.compressor.threshold,
                        ratio: merged.compressor.ratio,
                        attack: merged.compressor.attack,
                        release: merged.compressor.release,
                        enabled: true,
                      },
                      loudness: { gain: merged.loudness.gain, enabled: true },
                      limiter: { threshold: merged.limiter.threshold, ceiling: merged.limiter.ceiling, enabled: true },
                    });
                    
                    // Force playback to ensure effects are heard
                    setTimeout(() => {
                      try {
                        simplePreviewPlayerRef.current?.play();
                      } catch (e) {
                        console.warn('Auto-play failed:', e);
                      }
                    }, 100);
                    
                  } catch (e) {
                    console.error('Failed to apply effects:', e);
                  }
                  
                  if (selectedFile) {
                    setAnalyzing(true);
                    advancedAudioService
                      .analyzeFinal(selectedFile, 'advanced-final')
                      .then((data) => {
                        setAnalysis({
                          lufs: data?.metadata?.lufs,
                          peak_db: data?.peak_db,
                          rms_db: data?.rms_db,
                          stereo_correlation: data?.stereo_correlation,
                        });
                      })
                      .catch(() => {})
                      .finally(() => setAnalyzing(false));
                  }
                }}
              />
              </div>
            </div>

            {/* Processing summary removed as requested */}

            {/* Continue to Export Button */}
             <div className="text-center">
               <button
                 onClick={handleContinueToExport}
                 disabled={isProcessing}
                 className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                   isProcessing 
                     ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                     : 'bg-amber-500 text-black hover:bg-amber-600'
                 }`}
               >
                 {isProcessing ? (
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                     <span>Processing Audio...</span>
                   </div>
                 ) : (
                   'Continue to Export'
                 )}
               </button>
             </div>
          </div>
        );
      
             case 3:
         return (
           <ExportGate
             originalFile={selectedFile}
             processedAudioUrl={processedAudioUrl}
             audioEffects={audioEffects}
             onBack={() => setCurrentStep(2)}
             onUpdateEffectSettings={handleUpdateEffectSettings}
             // Removed meterData prop - using Python backend processing
             selectedGenre={selectedGenre}
           />
         );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen relative bg-black"
    >
      
      {/* Studio Header */}
      <div className="relative z-10">
        <StudioHeader 
          currentStep={currentStep} 
          credits={credits} 
          onNewSession={handleNewSession}
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
          genreLocked={genreLocked}
          onToggleGenreLock={handleToggleGenreLock}
          manualAdjustments={manualAdjustments}
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-8 md:px-16 lg:px-24 pt-4 pb-4">
        {renderCurrentStep()}
      </div>

      {/* Hidden SimplePreviewPlayer for export processing */}
      {currentStep === 3 && (
        <div style={{ display: 'none' }}>
          <SimplePreviewPlayer
            ref={simplePreviewPlayerRef}
            audioFile={selectedFile}
            selectedGenre={selectedGenre}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toastMessage}
        </div>
      )}

      {/* Processing Overlay */}
      <ProcessingOverlay
        visible={isProcessing}
        currentStepIndex={processingStep}
        steps={processingSteps}
        subtitle={selectedGenre ? `Genre: ${selectedGenre}` : undefined}
      />
    </div>
  );
};

export default AdvancedTierDashboard;

