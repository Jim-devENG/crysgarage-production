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
  Volume2
} from 'lucide-react';
import StudioHeader from './StudioHeader';
import FileUpload from './FileUpload';
import RealTimeMeters from './RealTimeMeters';
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
    loudness: { volume: 1, enabled: true },
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
      if (lockedEffectValues.eq && (
        effects.eq.low !== lockedEffectValues.eq.low ||
        effects.eq.mid !== lockedEffectValues.eq.mid ||
        effects.eq.high !== lockedEffectValues.eq.high
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
        effects.loudness.volume !== lockedEffectValues.loudness.volume
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
            effects.gMultiBand.thresholds?.[0] !== lockedEffectValues.gMultiBand.thresholds?.[0] ||
            effects.gMultiBand.ratios?.[0] !== lockedEffectValues.gMultiBand.ratios?.[0]
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
    
    setAudioEffects(prev => ({
      ...prev,
      [effectType]: { ...prev[effectType as keyof typeof prev], ...settings }
    }));
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
          volume: preset.gain
        },
                  limiter: {
            threshold: -1,
            ceiling: preset.truePeak
          },
          gDigitalTape: {
            saturation: preset.gDigitalTape?.saturation || 0
          },
          gMultiBand: {
            thresholds: preset.gMultiBand?.thresholds || [-20, -18, -16],
            ratios: preset.gMultiBand?.ratios || [3, 4, 5]
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
            volume: preset.gain, 
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
            thresholds: preset.gMultiBand?.thresholds || [-20, -18, -16],
            ratios: preset.gMultiBand?.ratios || [3, 4, 5],
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
      loudness: { volume: 1, enabled: true },
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
        mid: { threshold: -20, ratio: 4 }, 
        high: { threshold: -20, ratio: 4 }, 
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
            
            {/* Main Layout - Player/Meters on top, Genre under player */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Left Column - Player and Genre */}
              <div className="lg:col-span-2 space-y-3">
                {/* Real-time Mastering Player */}
                <RealTimeMasteringPlayer
                  ref={realTimeMasteringPlayerRef}
                  audioFile={selectedFile}
                  audioEffects={audioEffects}
                  meterData={meterData}
                  onMeterUpdate={handleMeterUpdate}
                  onEffectChange={handleEffectChange}
                  isProcessing={isProcessing}
                />
                
                {/* Genre Presets - Directly under player */}
                <GenrePresets
                  selectedGenre={selectedGenre}
                  onGenreSelect={handleGenreSelect}
                  genreLocked={genreLocked}
                  onToggleGenreLock={handleToggleGenreLock}
                />
                
                {/* Debug Panel - Remove this in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <h4 className="text-white font-semibold text-sm mb-2">Debug Info</h4>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>Genre Locked: {genreLocked ? 'Yes' : 'No'}</div>
                      <div>Selected Genre: {selectedGenre || 'None'}</div>
                      <div>Locked Values: {Object.keys(lockedEffectValues).join(', ') || 'None'}</div>
                      <div>Backup Values: {Object.keys(effectStateBackup).join(', ') || 'None'}</div>
                    </div>
                  </div>
                )}
              </div>

                             {/* Right Column - Meters Only */}
               <div className="lg:col-span-1">
                 {/* Real-time Meters */}
                 <RealTimeMeters 
                   meterData={meterData} 
                   meterSettings={meterSettings}
                   autoAdjust={autoAdjust}
                   audioEffects={audioEffects}
                   onUpdateEffectSettings={handleUpdateEffectSettings}
                   onManualInit={manualInit}
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
      className="min-h-screen relative bg-gradient-to-br from-black via-gray-900 to-black"
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
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
      <div className="relative z-10 container mx-auto px-4 py-4">
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
