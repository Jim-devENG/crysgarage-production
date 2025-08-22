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
import AnalysisPage from './AnalysisPage';
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

    // Calculate required adjustments
    const lufsDiff = preset.targetLufs - currentLufs;
    const peakDiff = preset.truePeak - currentPeak;

    // Generate optimization recommendations
    if (Math.abs(lufsDiff) > 0.5) {
      optimizations.push({
        type: 'loudness',
        adjustment: lufsDiff,
        description: `Adjust loudness by ${lufsDiff > 0 ? '+' : ''}${lufsDiff.toFixed(1)} dB to reach ${preset.targetLufs} dB target`
      });
    }

    if (Math.abs(peakDiff) > 0.05) {
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

  // Continue to analysis
  const handleContinueToAnalysis = async () => {
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
          setProcessedAudioUrl(processedUrl);
        } else {
          // Fallback to original file
          const fallbackUrl = URL.createObjectURL(selectedFile);
          setProcessedAudioUrl(fallbackUrl);
        }
        
        setCurrentStep(3);
      } catch (error) {
        console.error('Error in analysis transition:', error);
        // Final fallback
        const fallbackUrl = URL.createObjectURL(selectedFile);
        setProcessedAudioUrl(fallbackUrl);
        setCurrentStep(3);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Continue to export
  const handleContinueToExport = () => {
    setCurrentStep(4);
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

            {/* Intelligent Optimization Section */}
            {selectedGenre && meterData && (
              <div className="bg-gradient-to-br from-blue-900 to-indigo-800 rounded-lg p-6 border border-blue-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">AI</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Intelligent Optimization</h3>
                      <p className="text-sm text-blue-200">AI-powered mastering for {selectedGenre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">Current LUFS</div>
                    <div className="text-lg font-bold text-white">{meterData.lufs.toFixed(1)} dB</div>
                  </div>
                </div>

                {(() => {
                  const optimizationData = getIntelligentOptimizations();
                  if (!optimizationData) {
                    return (
                      <div className="text-center py-4">
                        <div className="text-gray-400 mb-2">No optimization data available</div>
                        <div className="text-xs text-gray-500">Select a different genre or adjust effects manually</div>
                      </div>
                    );
                  }

                  const { optimizations, targetValues } = optimizationData;
                  
                  return (
                    <div className="space-y-4">
                      {/* Target vs Current */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Target LUFS</div>
                          <div className="text-lg font-bold text-green-400">{targetValues.lufs} dB</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Target Peak</div>
                          <div className="text-lg font-bold text-blue-400">{targetValues.peak} dBTP</div>
                        </div>
                      </div>

                      {/* Optimization Recommendations */}
                      {optimizations.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-white flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                            Recommended Optimizations ({optimizations.length})
                          </h4>
                          
                          <div className="space-y-2">
                            {optimizations.map((opt, index) => (
                              <div key={index} className="bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white mb-1">{opt.type.charAt(0).toUpperCase() + opt.type.slice(1)}</div>
                                    <div className="text-xs text-gray-300">{opt.description}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-bold ${
                                      opt.adjustment > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {opt.adjustment > 0 ? '+' : ''}{opt.adjustment.toFixed(1)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-900 bg-opacity-20 rounded-lg p-4 border border-green-500 border-opacity-30">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-medium">Perfect! No optimizations needed.</span>
                          </div>
                          <p className="text-sm text-gray-300 mt-2">
                            Your mastering is already optimized for {selectedGenre} genre standards.
                          </p>
                        </div>
                      )}

                      {/* Auto-Optimize Button */}
                      <div className="text-center pt-4">
                        <button
                          onClick={applyIntelligentOptimizations}
                          disabled={optimizations.length === 0}
                          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                            optimizations.length === 0
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">AI</span>
                            </div>
                            <span>
                              {optimizations.length === 0 
                                ? 'Already Optimized' 
                                : `Auto-Optimize (${optimizations.length} changes)`
                              }
                            </span>
                          </div>
                        </button>
                        {optimizations.length > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Click to automatically apply all recommended optimizations
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Continue to Analysis Button */}
             <div className="text-center">
               <button
                 onClick={handleContinueToAnalysis}
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
                   'Continue to Analysis'
                 )}
               </button>
             </div>
          </div>
        );
      
             case 3:
         return (
           <AnalysisPage
             originalFile={selectedFile}
             processedAudioUrl={processedAudioUrl}
             audioEffects={audioEffects}
             meterData={meterData}
             selectedGenre={selectedGenre}
             onBack={() => setCurrentStep(2)}
             onContinue={handleContinueToExport}
           />
         );
       
       case 4:
         return (
           <ExportGate
             originalFile={selectedFile}
             processedAudioUrl={processedAudioUrl}
             audioEffects={audioEffects}
             onBack={() => setCurrentStep(3)}
             onUpdateEffectSettings={handleUpdateEffectSettings}
             meterData={meterData}
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
