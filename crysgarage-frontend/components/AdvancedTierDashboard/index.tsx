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
  CheckCircle
} from 'lucide-react';
import StudioHeader from './StudioHeader';
import FileUpload from './FileUpload';

import AudioEffects from './AudioEffects';
import ExportGate from './ExportGate/index';

import RealTimeMasteringPlayer, { RealTimeMasteringPlayerRef } from './RealTimeMasteringPlayer';
import StudioDashboard from './StudioDashboard';
import GenrePresets from './GenrePresets';
import { GENRE_PRESETS, multiplierToDb } from './sharedGenrePresets';

interface AdvancedTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftLevel: number;
  rightLevel: number;
  frequencyData: number[];
  goniometerData: number[];
}

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [meterData, setMeterData] = useState<MeterData>({
    lufs: -20,
    peak: -6,
    rms: -12,
    correlation: 0.8,
    leftLevel: -6,
    rightLevel: -6,
    frequencyData: new Array(256).fill(0),
    goniometerData: new Array(256).fill(0)
  });

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
    gTuner: { enabled: false, frequency: 450 }
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
  const realTimeMasteringPlayerRef = useRef<RealTimeMasteringPlayerRef>(null);

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

  const manualInit = useCallback(() => {
    try {
      realTimeMasteringPlayerRef.current?.manualInitializeAudioContext();
    } catch {}
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
    }
  };

  // Handle meter data updates
  const handleMeterUpdate = (newMeterData: MeterData) => {
    setMeterData(newMeterData);
  };

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
    if (!selectedGenre || !meterData) return null;

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

    const currentLufs = meterData.lufs;
    const currentPeak = meterData.peak;
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

    // Track that these are AI optimizations
    const newManualAdjustments = new Set(manualAdjustments);
    optimizations.forEach(opt => {
      newManualAdjustments.add(opt.type);
    });
    setManualAdjustments(newManualAdjustments);
  };



  // Continue to export
  const handleContinueToExport = async () => {
    if (selectedFile) {
      setIsProcessing(true);
      try {
        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 3000); // 3 second timeout
        });

        let processedUrl: string | null = null;

        // Try to get processed audio if mastering player is available
        if (realTimeMasteringPlayerRef.current) {
          try {
            processedUrl = await Promise.race([
              realTimeMasteringPlayerRef.current.getProcessedAudioUrl(),
              timeoutPromise
            ]) as string | null;
          } catch (error) {
            console.error('Error getting processed audio:', error);
          }
        }

        // Use processed URL if available, otherwise fallback to original
        if (processedUrl) {
          console.log('✅ Using processed audio URL:', processedUrl);
          setProcessedAudioUrl(processedUrl);
        } else {
          // Fallback to original file
          console.log('⚠️ Using fallback to original audio (processed audio recording failed)');
          const fallbackUrl = URL.createObjectURL(selectedFile);
          setProcessedAudioUrl(fallbackUrl);
        }
        
        setCurrentStep(3);
      } catch (error) {
        console.error('Error in export transition:', error);
        // Final fallback
        const fallbackUrl = URL.createObjectURL(selectedFile);
        setProcessedAudioUrl(fallbackUrl);
        setCurrentStep(3);
      } finally {
        setIsProcessing(false);
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
  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
    const preset = GENRE_PRESETS[genreId];
    if (preset) {
      // Store the preset for genre lock system
      setLockedGenrePreset(preset);
      
      // Store the locked effect values for this genre
      const lockedValues = {
        eq: {
          bands: [
            { frequency: 60, gain: multiplierToDb(preset.eq.low), q: 1, type: 'lowshelf' as const },
            { frequency: 150, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
            { frequency: 400, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
            { frequency: 1000, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
            { frequency: 2500, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
            { frequency: 6000, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
            { frequency: 10000, gain: multiplierToDb(preset.eq.high), q: 1, type: 'peaking' as const },
            { frequency: 16000, gain: multiplierToDb(preset.eq.high), q: 1, type: 'highshelf' as const }
          ]
        },
        compressor: {
          threshold: preset.compression.threshold,
          ratio: preset.compression.ratio,
          attack: Math.round(preset.compression.attack * 1000),
          release: Math.round(preset.compression.release * 1000)
        },
        loudness: {
          gain: multiplierToDb(preset.gain)
        },
                  limiter: {
            threshold: -1,
            ceiling: preset.truePeak
          },
          gDigitalTape: {
            saturation: preset.gDigitalTape?.saturation || 0
          },
          gMultiBand: {
            low: { 
              threshold: preset.gMultiBand?.thresholds?.[0] || -20, 
              ratio: preset.gMultiBand?.ratios?.[0] || 3 
            },
            mid: { 
              threshold: preset.gMultiBand?.thresholds?.[1] || -18, 
              ratio: preset.gMultiBand?.ratios?.[1] || 4 
            },
            high: { 
              threshold: preset.gMultiBand?.thresholds?.[2] || -16, 
              ratio: preset.gMultiBand?.ratios?.[2] || 5 
            }
          }
        };
      setLockedEffectValues(lockedValues);
      
      console.log(`Genre selected: ${genreId}`, {
        preset,
        lockedValues,
        genreLocked
      });
      
      // Store current effect states before applying presets
      setAudioEffects(prev => {
        const backup = {
          eq: { ...prev.eq },
          compressor: { ...prev.compressor },
          loudness: { ...prev.loudness },
          limiter: { ...prev.limiter }
        };
        setEffectStateBackup(backup);
        
        // Always apply genre preset when a genre is selected
        return {
          ...prev,
          eq: { 
            ...prev.eq, 
            bands: [
              { frequency: 60, gain: multiplierToDb(preset.eq.low), q: 1, type: 'lowshelf' as const },
              { frequency: 150, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 400, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 1000, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 2500, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 6000, gain: multiplierToDb(preset.eq.mid), q: 1, type: 'peaking' as const },
              { frequency: 10000, gain: multiplierToDb(preset.eq.high), q: 1, type: 'peaking' as const },
              { frequency: 16000, gain: multiplierToDb(preset.eq.high), q: 1, type: 'highshelf' as const }
            ],
            enabled: true 
          },
          compressor: { 
            ...prev.compressor, 
            threshold: preset.compression.threshold, 
            ratio: preset.compression.ratio, 
            attack: Math.round(preset.compression.attack * 1000), 
            release: Math.round(preset.compression.release * 1000), 
            enabled: true 
          },
                  loudness: {
          ...prev.loudness,
          gain: multiplierToDb(preset.gain),
          enabled: true
        },
          limiter: { 
            ...prev.limiter, 
            threshold: -1, 
            ceiling: preset.truePeak, 
            enabled: true 
          },
          gDigitalTape: {
            ...prev.gDigitalTape,
            saturation: preset.gDigitalTape?.saturation || 0,
            enabled: preset.gDigitalTape?.enabled || false
          },
          gMultiBand: {
            ...prev.gMultiBand,
            low: { 
              threshold: preset.gMultiBand?.thresholds?.[0] || -20, 
              ratio: preset.gMultiBand?.ratios?.[0] || 3 
            },
            mid: { 
              threshold: preset.gMultiBand?.thresholds?.[1] || -18, 
              ratio: preset.gMultiBand?.ratios?.[1] || 4 
            },
            high: { 
              threshold: preset.gMultiBand?.thresholds?.[2] || -16, 
              ratio: preset.gMultiBand?.ratios?.[2] || 5 
            },
            enabled: preset.gMultiBand?.enabled || false
          }
        };
      });
      
      // Clear manual adjustments tracking since we're applying a new genre preset
      setManualAdjustments(new Set());
      
      // Ensure audio is initialized for immediate preview
      setTimeout(() => manualInit(), 0);
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
    setMeterData({
      lufs: -20,
      peak: -6,
      rms: -12,
      correlation: 0.8,
      leftLevel: -6,
      rightLevel: -6,
      frequencyData: new Array(256).fill(0),
      goniometerData: new Array(256).fill(0)
    });

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
      gTuner: { enabled: false, frequency: 450 }
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
          <div className="space-y-4">
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
            <div className="grid grid-cols-1 gap-3">
              {/* Player and Genre */}
              <div className="space-y-3">
                {/* Real-time Mastering Player */}
                <RealTimeMasteringPlayer
                  ref={realTimeMasteringPlayerRef}
                  audioFile={selectedFile}
                  audioEffects={audioEffects}
                  meterData={meterData}
                  onMeterUpdate={handleMeterUpdate}
                  onEffectChange={handleEffectChange}
                  isProcessing={isProcessing}
                  selectedGenre={selectedGenre}
                />
                
                {/* Genre Presets - Directly under player */}
                <GenrePresets
                  selectedGenre={selectedGenre}
                  onGenreSelect={handleGenreSelect}
                  genreLocked={genreLocked}
                  onToggleGenreLock={handleToggleGenreLock}
                />

              </div>
            </div>

            {/* Studio Dashboard - Full width below */}
            <div className="grid grid-cols-1 gap-3">
              <StudioDashboard
                audioEffects={audioEffects}
                onUpdateEffectSettings={handleUpdateEffectSettings}
                onTogglePremiumEffect={handleTogglePremiumEffect}
                onToggleEffect={handleToggleEffect}
                selectedGenre={selectedGenre}
                onGenreSelect={handleGenreSelect}
                meterData={meterData}
                onManualInit={manualInit}
                manualAdjustments={manualAdjustments}
                lockedEffectValues={lockedEffectValues}
              />
            </div>

            {/* Genre Mastering Reference Guide */}
            {selectedGenre && (
              <div className="bg-gradient-to-br from-blue-900 to-indigo-800 rounded-lg p-6 border border-blue-500 border-opacity-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Processing Summary</h3>
                      <p className="text-sm text-green-200">Mastered audio analysis and applied changes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-300">Advanced</div>
                    <div className="text-xs text-green-400 font-medium">Mastering</div>
                  </div>
                </div>

                {(() => {
                  // Get genre-specific preset values
                  const genreKey = selectedGenre.toLowerCase().replace(/\s+/g, '-');
                  const professionalPresets = {
                    trap: { targetLufs: -7.2, truePeak: -0.1, gain: 1.9, compression: { ratio: 3 } },
                    'hip-hop': { targetLufs: -8.0, truePeak: -0.2, gain: 1.8, compression: { ratio: 3 } },
                    afrobeats: { targetLufs: -7.0, truePeak: -0.1, gain: 2.0, compression: { ratio: 3 } },
                    drill: { targetLufs: -7.5, truePeak: -0.15, gain: 1.85, compression: { ratio: 3 } },
                    dubstep: { targetLufs: -7.0, truePeak: -0.1, gain: 2.0, compression: { ratio: 3 } },
                    gospel: { targetLufs: -8.5, truePeak: -0.3, gain: 1.65, compression: { ratio: 2.5 } },
                    'r-b': { targetLufs: -8.8, truePeak: -0.35, gain: 1.6, compression: { ratio: 2.5 } },
                    'lofi-hiphop': { targetLufs: -9.0, truePeak: -0.4, gain: 1.5, compression: { ratio: 2 } },
                    'crysgarage': { targetLufs: -7.8, truePeak: -0.15, gain: 1.8, compression: { ratio: 3 } },
                    house: { targetLufs: -8.0, truePeak: -0.2, gain: 1.8, compression: { ratio: 3 } },
                    techno: { targetLufs: -7.5, truePeak: -0.15, gain: 1.85, compression: { ratio: 3 } },
                    highlife: { targetLufs: -8.2, truePeak: -0.25, gain: 1.7, compression: { ratio: 2.5 } },
                    instrumentals: { targetLufs: -8.5, truePeak: -0.3, gain: 1.65, compression: { ratio: 2.5 } },
                    beats: { targetLufs: -8.0, truePeak: -0.2, gain: 1.8, compression: { ratio: 3 } },
                    amapiano: { targetLufs: -8.0, truePeak: -0.2, gain: 1.8, compression: { ratio: 3 } },
                    trance: { targetLufs: -7.8, truePeak: -0.15, gain: 1.8, compression: { ratio: 3 } },
                    'drum-bass': { targetLufs: -7.0, truePeak: -0.1, gain: 2.0, compression: { ratio: 3 } },
                    reggae: { targetLufs: -8.2, truePeak: -0.25, gain: 1.7, compression: { ratio: 2.5 } },
                    'voice-over': { targetLufs: -9.2, truePeak: -0.4, gain: 1.4, compression: { ratio: 2 } },
                    journalist: { targetLufs: -9.5, truePeak: -0.45, gain: 1.35, compression: { ratio: 2 } },
                    soul: { targetLufs: -8.8, truePeak: -0.35, gain: 1.6, compression: { ratio: 2.5 } },
                    'content-creator': { targetLufs: -8.5, truePeak: -0.3, gain: 1.65, compression: { ratio: 2.5 } },
                    pop: { targetLufs: -8.0, truePeak: -0.25, gain: 1.8, compression: { ratio: 3 } },
                    jazz: { targetLufs: -9.0, truePeak: -0.4, gain: 1.5, compression: { ratio: 2 } }
                  };
                  
                  const preset = professionalPresets[genreKey] || { targetLufs: -8.0, truePeak: -0.2, gain: 1.8, compression: { ratio: 3 } };
                  
                  // Calculate applied changes based on current effect settings
                  const gainApplied = Math.round((audioEffects.loudness.gain + 12) * 10) / 10; // Convert from -12 to +12 range
                  const compressionApplied = `${audioEffects.compressor.ratio}:1`;
                  
                  return (
                    <div className="space-y-4">
                      {/* File Information */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Original File</h4>
                          <p className="text-sm text-gray-400">{fileInfo?.name || 'Audio File'}</p>
                          <p className="text-xs text-gray-500">{fileInfo ? (fileInfo.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Applied Genre</h4>
                          <p className="text-sm text-crys-gold">{selectedGenre}</p>
                          <p className="text-xs text-gray-500">Professional mastering preset</p>
                        </div>
                      </div>
                      
                      {/* Applied Changes */}
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-crys-gold">Applied Changes</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-crys-gold">+{gainApplied}dB</div>
                            <div className="text-xs text-gray-400">Gain Boost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-crys-gold">{compressionApplied}</div>
                            <div className="text-xs text-gray-400">Compression</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-crys-gold">{preset.targetLufs} LUFS</div>
                            <div className="text-xs text-gray-400">Target Loudness</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-crys-gold">{preset.truePeak} dB</div>
                            <div className="text-xs text-gray-400">True Peak</div>
                          </div>
                        </div>
                      </div>



                      {/* Processing Status */}
                      <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-2">Processing Status</div>
                        <div className="text-xs text-gray-300">
                          Audio is being processed in real-time with {selectedGenre} mastering effects. 
                          Adjust the effects above to fine-tune your sound.
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

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
             meterData={meterData}
             selectedGenre={selectedGenre}
             getProcessedAudioUrl={() => realTimeMasteringPlayerRef.current?.getProcessedAudioUrl() || Promise.resolve(null)}
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

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default AdvancedTierDashboard;

