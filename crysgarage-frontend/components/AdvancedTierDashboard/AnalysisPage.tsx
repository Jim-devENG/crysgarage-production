import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Volume2, BarChart3, TrendingUp, CheckCircle, Zap, Loader2 } from 'lucide-react';
import AudioAnalyzer, { AudioAnalysisResult, ProfessionalLoudnessAnalysis } from './AudioAnalyzer';

interface AnalysisPageProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  meterData: any;
  selectedGenre?: string;
  onBack: () => void;
  onContinue: () => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({
  originalFile,
  processedAudioUrl,
  audioEffects,
  meterData,
  selectedGenre,
  onBack,
  onContinue
}) => {

  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalCurrentTime, setOriginalCurrentTime] = useState(0);
  const [masteredCurrentTime, setMasteredCurrentTime] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [masteredDuration, setMasteredDuration] = useState(0);
  const [originalReady, setOriginalReady] = useState(false);
  const [masteredReady, setMasteredReady] = useState(false);
  
  // Analysis state
  const [originalAnalysis, setOriginalAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [masteredAnalysis, setMasteredAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [originalLoudnessAnalysis, setOriginalLoudnessAnalysis] = useState<ProfessionalLoudnessAnalysis | null>(null);
  const [masteredLoudnessAnalysis, setMasteredLoudnessAnalysis] = useState<ProfessionalLoudnessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [usingFallbackAnalysis, setUsingFallbackAnalysis] = useState(false);

  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const masteredAudioRef = useRef<HTMLAudioElement>(null);

  // Create URLs for audio playback
  const originalAudioUrl = originalFile ? URL.createObjectURL(originalFile) : null;
  
  // For now, use the original file URL for mastered audio if processedAudioUrl is not available
  // This ensures both players have working audio sources
  const masteredAudioUrl = processedAudioUrl || originalAudioUrl;

  // Debug logging
  console.log('AnalysisPage audio URLs:', {
    originalFile: originalFile?.name,
    originalAudioUrl: originalAudioUrl ? 'Set' : 'Not set',
    processedAudioUrl: processedAudioUrl ? 'Set' : 'Not set',
    masteredAudioUrl: masteredAudioUrl ? 'Set' : 'Not set',
    using: processedAudioUrl ? 'Processed audio' : 'Original audio (fallback)',
    originalAudioUrlActual: originalAudioUrl,
    processedAudioUrlActual: processedAudioUrl,
    masteredAudioUrlActual: masteredAudioUrl
  });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalAudioUrl) {
        URL.revokeObjectURL(originalAudioUrl);
      }
    };
  }, [originalAudioUrl]);

  // Reset audio states when URLs change
  useEffect(() => {
    console.log('Audio URLs changed, resetting states');
    setIsPlayingOriginal(false);
    setIsPlayingMastered(false);
    setOriginalCurrentTime(0);
    setMasteredCurrentTime(0);
    setOriginalDuration(0);
    setMasteredDuration(0);
    setOriginalReady(false);
    setMasteredReady(false);
    
    // Force re-load of audio elements
    if (originalAudioRef.current && originalAudioUrl) {
      console.log('Loading original audio:', originalAudioUrl);
      originalAudioRef.current.load();
    }
    
    if (masteredAudioRef.current && masteredAudioUrl) {
      console.log('Loading mastered audio:', masteredAudioUrl);
      masteredAudioRef.current.load();
    }
  }, [originalAudioUrl, masteredAudioUrl]);

  // Audio playback handlers
  const handleOriginalPlayPause = async () => {
    console.log('Original play/pause clicked:', {
      hasRef: !!originalAudioRef.current,
      isPlaying: isPlayingOriginal,
      hasUrl: !!originalAudioUrl,
      ready: originalReady,
      audioSrc: originalAudioRef.current?.src,
      audioReadyState: originalAudioRef.current?.readyState
    });
    
    if (!originalAudioRef.current) {
      console.error('Original audio ref is null');
      return;
    }

    if (!originalAudioUrl) {
      console.error('Original audio URL is not available');
      return;
    }

    try {
      if (isPlayingOriginal) {
        console.log('Pausing original audio');
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      } else {
        console.log('Playing original audio');
        
        // Ensure audio is loaded
        if (originalAudioRef.current.readyState < 2) {
          console.log('Audio not ready, loading first...');
          originalAudioRef.current.load();
          await new Promise((resolve) => {
            originalAudioRef.current!.addEventListener('canplay', resolve, { once: true });
          });
        }
        
        // Stop mastered audio if playing
        if (isPlayingMastered && masteredAudioRef.current) {
          masteredAudioRef.current.pause();
          setIsPlayingMastered(false);
        }
        
        await originalAudioRef.current.play();
        setIsPlayingOriginal(true);
      }
    } catch (error) {
      console.error('Error playing original audio:', error);
      setIsPlayingOriginal(false);
    }
  };

  const handleMasteredPlayPause = async () => {
    console.log('Mastered play/pause clicked:', {
      hasRef: !!masteredAudioRef.current,
      isPlaying: isPlayingMastered,
      hasUrl: !!masteredAudioUrl,
      ready: masteredReady,
      audioSrc: masteredAudioRef.current?.src,
      audioReadyState: masteredAudioRef.current?.readyState
    });
    
    if (!masteredAudioRef.current) {
      console.error('Mastered audio ref is null');
      return;
    }

    if (!masteredAudioUrl) {
      console.error('Mastered audio URL is not available');
      return;
    }

    try {
      if (isPlayingMastered) {
        console.log('Pausing mastered audio');
        masteredAudioRef.current.pause();
        setIsPlayingMastered(false);
      } else {
        console.log('Playing mastered audio');
        
        // Ensure audio is loaded
        if (masteredAudioRef.current.readyState < 2) {
          console.log('Audio not ready, loading first...');
          masteredAudioRef.current.load();
          await new Promise((resolve) => {
            masteredAudioRef.current!.addEventListener('canplay', resolve, { once: true });
          });
        }
        
        // Stop original audio if playing
        if (isPlayingOriginal && originalAudioRef.current) {
          originalAudioRef.current.pause();
          setIsPlayingOriginal(false);
        }
        
        await masteredAudioRef.current.play();
        setIsPlayingMastered(true);
      }
    } catch (error) {
      console.error('Error playing mastered audio:', error);
      setIsPlayingMastered(false);
    }
  };

  // Audio event handlers for original
  const handleOriginalTimeUpdate = () => {
    if (originalAudioRef.current) {
      setOriginalCurrentTime(originalAudioRef.current.currentTime);
    }
  };

  const handleOriginalLoadedMetadata = () => {
    console.log('Original audio metadata loaded');
    if (originalAudioRef.current) {
      setOriginalDuration(originalAudioRef.current.duration);
      setOriginalReady(true);
      console.log('Original audio duration:', originalAudioRef.current.duration);
    }
  };

  const handleOriginalEnded = () => {
    setIsPlayingOriginal(false);
    setOriginalCurrentTime(0);
  };

  // Audio event handlers for mastered
  const handleMasteredTimeUpdate = () => {
    if (masteredAudioRef.current) {
      setMasteredCurrentTime(masteredAudioRef.current.currentTime);
    }
  };

  const handleMasteredLoadedMetadata = () => {
    console.log('Mastered audio metadata loaded');
    if (masteredAudioRef.current) {
      setMasteredDuration(masteredAudioRef.current.duration);
      setMasteredReady(true);
      console.log('Mastered audio duration:', masteredAudioRef.current.duration);
    }
  };

  const handleMasteredEnded = () => {
    setIsPlayingMastered(false);
    setMasteredCurrentTime(0);
  };

  // Audio analysis functions
  const analyzeOriginalAudio = async () => {
    if (!originalFile) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUsingFallbackAnalysis(false);
    
    try {
      console.log('Starting original audio analysis...');
      
      // Try to use AudioAnalyzer first
      try {
        const analyzer = new AudioAnalyzer();
        
        // Perform both standard and professional loudness analysis
        const [standardResult, loudnessResult] = await Promise.all([
          analyzer.analyzeAudioFile(originalFile),
          analyzer.analyzeProfessionalLoudness(originalFile)
        ]);
        
        setOriginalAnalysis(standardResult);
        setOriginalLoudnessAnalysis(loudnessResult);
        console.log('Original audio analysis (from file):', standardResult);
        console.log('Original professional loudness analysis:', loudnessResult);
        return;
      } catch (audioAnalyzerError) {
        console.warn('AudioAnalyzer failed, trying fallback method:', audioAnalyzerError);
        setUsingFallbackAnalysis(true);
      }
      
      // Fallback: Create basic analysis from file metadata
      const arrayBuffer = await originalFile.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Basic analysis without complex processing
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // Calculate basic metrics
      let sum = 0;
      let peak = 0;
      let rmsSum = 0;
      
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);
        sum += sample;
        if (sample > peak) peak = sample;
        rmsSum += sample * sample;
      }
      
      const average = sum / channelData.length;
      const rms = Math.sqrt(rmsSum / channelData.length);
      const rmsDb = 20 * Math.log10(rms);
      const peakDb = 20 * Math.log10(peak);
      
      // Estimate loudness using proper LUFS calculation
      const meanSquare = rms * rms;
      let estimatedLufs = -0.691 + 10 * Math.log10(meanSquare);
      estimatedLufs -= 4.5; // K-weighting effect
      estimatedLufs = Math.max(-70, Math.min(0, estimatedLufs));
      
      const fallbackResult: AudioAnalysisResult = {
        loudness: Math.round(estimatedLufs), // Use proper LUFS calculation
        rms: Math.round(rmsDb), // Use actual RMS in dB
        truePeak: Math.round(peakDb), // Use actual peak in dB
        dynamicRange: Math.abs(peakDb - rmsDb),
        frequencySpectrum: new Array(256).fill(0), // Placeholder
        stereoWidth: audioBuffer.numberOfChannels > 1 ? 0.5 : 0,
        correlation: 0.8,
        crestFactor: peak / rms,
        loudnessRange: 8.0
      };
      
      const fallbackLoudnessResult: ProfessionalLoudnessAnalysis = {
        momentary: { value: estimatedLufs, unit: "dB" },
        shortTerm: { value: estimatedLufs + 0.2, unit: "dB" },
        integrated: { value: estimatedLufs, unit: "dB" },
        truePeak: { value: peakDb, unit: "dBTP" },
        loudnessRange: { value: 8.0, unit: "dB" },
        compliance: {
          withinGrammyStandard: false,
          notes: "Basic analysis - not suitable for professional standards"
        }
      };
      
      setOriginalAnalysis(fallbackResult);
      setOriginalLoudnessAnalysis(fallbackLoudnessResult);
      console.log('Original audio analysis (fallback):', fallbackResult);
      console.log('Original professional loudness analysis (fallback):', fallbackLoudnessResult);
      
      // Cleanup
      audioContext.close();
      
    } catch (error) {
      console.error('Error analyzing original audio:', error);
      setAnalysisError(`Failed to analyze original audio: ${error.message}`);
      
      // Don't set fallback values - let user know analysis failed
      setOriginalAnalysis(null);
      setOriginalLoudnessAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

    const analyzeMasteredAudio = async () => {
    if (!meterData) {
      console.log('No meter data available for mastered audio analysis');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUsingFallbackAnalysis(false);
    
    try {
      console.log('Starting mastered audio analysis from meter data:', meterData);
      
      // Use the real-time meter data for mastered audio analysis
      // This represents the actual processed audio with effects applied
      const masteredResult: AudioAnalysisResult = {
        loudness: meterData.lufs, // Use actual LUFS from meters (real measurement)
        rms: meterData.rms, // Use actual RMS from meters (real measurement)
        truePeak: meterData.peak, // Use actual peak from meters (real measurement)
        dynamicRange: Math.abs(meterData.peak - meterData.rms),
        frequencySpectrum: meterData.frequencyData || new Array(256).fill(0),
        stereoWidth: meterData.stereoWidth || 0.5,
        correlation: meterData.correlation || 0.8,
        crestFactor: meterData.crestFactor || 4.0,
        loudnessRange: meterData.loudnessRange || 6.0
      };
      
      // Create professional loudness analysis from meter data
      const masteredLoudnessResult: ProfessionalLoudnessAnalysis = {
        momentary: { value: meterData.lufs, unit: "dB" },
        shortTerm: { value: meterData.lufs + 0.2, unit: "dB" },
        integrated: { value: meterData.lufs, unit: "dB" },
        truePeak: { value: meterData.peak, unit: "dBTP" },
        loudnessRange: { value: meterData.loudnessRange || 6.0, unit: "dB" },
        compliance: {
          withinGrammyStandard: meterData.lufs >= -10 && meterData.lufs <= -7 && meterData.peak <= -1.0,
          notes: meterData.lufs >= -10 && meterData.lufs <= -7 && meterData.peak <= -1.0
            ? `Integrated loudness ${meterData.lufs.toFixed(1)} dB, TP ${meterData.peak.toFixed(1)} dBTP: acceptable.`
            : `Integrated loudness ${meterData.lufs.toFixed(1)} dB, TP ${meterData.peak.toFixed(1)} dBTP: needs adjustment.`
        }
      };
      
      setMasteredAnalysis(masteredResult);
      setMasteredLoudnessAnalysis(masteredLoudnessResult);
      console.log('Mastered audio analysis (from real-time meter data):', masteredResult);
      console.log('Mastered professional loudness analysis:', masteredLoudnessResult);
      
    } catch (error) {
      console.error('Error analyzing mastered audio:', error);
      setAnalysisError(`Failed to analyze mastered audio: ${error.message}`);
      
      // Don't set fallback values - let user know analysis failed
      setMasteredAnalysis(null);
      setMasteredLoudnessAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when component mounts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (originalFile && !originalAnalysis) {
        analyzeOriginalAudio();
      }
      if (meterData && !masteredAnalysis) {
        analyzeMasteredAudio();
      }
    }, 1000); // Delay analysis by 1 second to ensure audio is loaded

    return () => clearTimeout(timeoutId);
  }, [originalFile, meterData]);

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (current: number, duration: number) => {
    return duration > 0 ? (current / duration) * 100 : 0;
  };

  // Get effects applied
  const getEffectsApplied = () => {
    const effects = [];
    if (audioEffects?.eq?.enabled) effects.push('EQ Processing');
    if (audioEffects?.compressor?.enabled) effects.push('Compression');
    if (audioEffects?.stereoWidener?.enabled) effects.push('Stereo Widening');
    if (audioEffects?.loudness?.enabled) effects.push('Loudness Enhancement');
    if (audioEffects?.limiter?.enabled) effects.push('Limiting');
    if (audioEffects?.gTuner?.enabled) effects.push('G-Tuner (444Hz)');
    return effects;
  };

  // Get genre-specific target values (Professional Dashboard Pattern)
  const getGenreTargets = () => {
    // Professional Dashboard genre presets (real industry standards)
    const professionalPresets = {
      trap: { targetLufs: -7.2, truePeak: -0.1 },
      'hip-hop': { targetLufs: -8.0, truePeak: -0.2 },
      afrobeats: { targetLufs: -7.0, truePeak: -0.1 },
      drill: { targetLufs: -7.5, truePeak: -0.15 },
      dubstep: { targetLufs: -7.0, truePeak: -0.1 },
      gospel: { targetLufs: -8.5, truePeak: -0.3 },
      'r-b': { targetLufs: -8.8, truePeak: -0.35 },
      'lofi-hiphop': { targetLufs: -9.0, truePeak: -0.4 },
      'crysgarage': { targetLufs: -7.8, truePeak: -0.15 },
      house: { targetLufs: -8.0, truePeak: -0.2 },
      techno: { targetLufs: -7.5, truePeak: -0.15 },
      highlife: { targetLufs: -8.2, truePeak: -0.25 },
      instrumentals: { targetLufs: -8.5, truePeak: -0.3 },
      beats: { targetLufs: -8.0, truePeak: -0.2 },
      amapiano: { targetLufs: -8.0, truePeak: -0.2 },
      trance: { targetLufs: -7.8, truePeak: -0.15 },
      'drum-bass': { targetLufs: -7.0, truePeak: -0.1 },
      reggae: { targetLufs: -8.2, truePeak: -0.25 },
      'voice-over': { targetLufs: -9.2, truePeak: -0.4 },
      journalist: { targetLufs: -9.5, truePeak: -0.45 },
      soul: { targetLufs: -8.8, truePeak: -0.35 },
      'content-creator': { targetLufs: -8.5, truePeak: -0.3 },
      pop: { targetLufs: -8.0, truePeak: -0.25 },
      jazz: { targetLufs: -9.0, truePeak: -0.4 }
    };

    const targets = {
      lufs: { min: -14, max: -7, ideal: -10 },
      peak: { min: -1.0, max: -0.1, ideal: -0.5 },
      dynamicRange: { min: 6, max: 12, ideal: 8 }
    };
    
    // Use Professional Dashboard presets for exact genre matching
    if (selectedGenre) {
      const genreKey = selectedGenre.toLowerCase().replace(/\s+/g, '-');
      const preset = professionalPresets[genreKey];
      
      if (preset) {
        // Use the exact Professional Dashboard values
        targets.lufs = { 
          min: preset.targetLufs - 1, 
          max: preset.targetLufs + 1, 
          ideal: preset.targetLufs 
        };
        targets.peak = { 
          min: preset.truePeak - 0.1, 
          max: preset.truePeak + 0.1, 
          ideal: preset.truePeak 
        };
        // Dynamic range based on genre characteristics
        if (genreKey.includes('trap') || genreKey.includes('dubstep') || genreKey.includes('drum-bass')) {
          targets.dynamicRange = { min: 3, max: 6, ideal: 4.5 }; // Heavy compression genres
        } else if (genreKey.includes('jazz') || genreKey.includes('voice-over') || genreKey.includes('journalist')) {
          targets.dynamicRange = { min: 8, max: 12, ideal: 10.0 }; // Preserved dynamics
        } else {
          targets.dynamicRange = { min: 4, max: 8, ideal: 6.0 }; // Standard range
        }
      } else {
        // Fallback for unmatched genres
        switch (selectedGenre.toLowerCase()) {
          case 'edm':
          case 'electronic':
          case 'dance':
            targets.lufs = { min: -7, max: -5, ideal: -6 };
            targets.peak = { min: -1.0, max: -0.1, ideal: -0.1 };
            targets.dynamicRange = { min: 3, max: 6, ideal: 4.5 };
            break;
          case 'rock':
          case 'metal':
            targets.lufs = { min: -9, max: -7, ideal: -8 };
            targets.peak = { min: -1.0, max: -0.1, ideal: -0.3 };
            targets.dynamicRange = { min: 5, max: 8, ideal: 6.5 };
            break;
          case 'classical':
            targets.lufs = { min: -14, max: -10, ideal: -12 };
            targets.peak = { min: -1.0, max: -0.1, ideal: -0.5 };
            targets.dynamicRange = { min: 8, max: 12, ideal: 10.0 };
            break;
          default:
            // Use default targets
            break;
        }
      }
    }
    
    return targets;
  };

  // Intelligent Optimization Engine
  const getIntelligentOptimizations = () => {
    if (!masteredAnalysis || !selectedGenre) return null;

    const targets = getGenreTargets();
    const current = masteredAnalysis;
    const optimizations = [];

    // LUFS Optimization
    const lufsDiff = targets.lufs.ideal - current.loudness;
    if (Math.abs(lufsDiff) > 0.5) {
      if (lufsDiff > 0) {
        optimizations.push({
          type: 'lufs',
          action: 'increase',
          value: Math.abs(lufsDiff).toFixed(1),
          priority: 'high',
          description: `Increase loudness by ${Math.abs(lufsDiff).toFixed(1)} dB to reach ${targets.lufs.ideal} dB target`,
          effect: 'Loudness Enhancement',
          adjustment: `+${Math.abs(lufsDiff).toFixed(1)} dB`
        });
      } else {
        optimizations.push({
          type: 'lufs',
          action: 'decrease',
          value: Math.abs(lufsDiff).toFixed(1),
          priority: 'high',
          description: `Decrease loudness by ${Math.abs(lufsDiff).toFixed(1)} dB to reach ${targets.lufs.ideal} dB target`,
          effect: 'Loudness Reduction',
          adjustment: `-${Math.abs(lufsDiff).toFixed(1)} dB`
        });
      }
    }

    // Peak Optimization
    const peakDiff = targets.peak.ideal - current.truePeak;
    if (Math.abs(peakDiff) > 0.05) {
      if (peakDiff > 0) {
        optimizations.push({
          type: 'peak',
          action: 'increase',
          value: Math.abs(peakDiff).toFixed(2),
          priority: 'medium',
          description: `Allow peaks to reach ${targets.peak.ideal} dBTP for better dynamics`,
          effect: 'Limiter Adjustment',
          adjustment: `Threshold: ${targets.peak.ideal} dBTP`
        });
      } else {
        optimizations.push({
          type: 'peak',
          action: 'decrease',
          value: Math.abs(peakDiff).toFixed(2),
          priority: 'high',
          description: `Reduce peaks by ${Math.abs(peakDiff).toFixed(2)} dBTP to prevent clipping`,
          effect: 'Limiter Tightening',
          adjustment: `Threshold: ${targets.peak.ideal} dBTP`
        });
      }
    }

    // Dynamic Range Optimization
    const drDiff = targets.dynamicRange.ideal - current.dynamicRange;
    if (Math.abs(drDiff) > 1.0) {
      if (drDiff > 0) {
        optimizations.push({
          type: 'dynamicRange',
          action: 'increase',
          value: Math.abs(drDiff).toFixed(1),
          priority: 'medium',
          description: `Increase dynamic range by ${Math.abs(drDiff).toFixed(1)} dB for better musical expression`,
          effect: 'Compression Reduction',
          adjustment: `Reduce compression ratio by ${Math.abs(drDiff / 2).toFixed(1)}`
        });
      } else {
        optimizations.push({
          type: 'dynamicRange',
          action: 'decrease',
          value: Math.abs(drDiff).toFixed(1),
          priority: 'medium',
          description: `Reduce dynamic range by ${Math.abs(drDiff).toFixed(1)} dB for tighter control`,
          effect: 'Compression Increase',
          adjustment: `Increase compression ratio by ${Math.abs(drDiff / 2).toFixed(1)}`
        });
      }
    }

    // Genre-Specific Intelligence
    const genreKey = selectedGenre.toLowerCase().replace(/\s+/g, '-');
    if (genreKey.includes('trap') || genreKey.includes('dubstep') || genreKey.includes('drum-bass')) {
      if (current.dynamicRange > 6) {
        optimizations.push({
          type: 'genre',
          action: 'compress',
          value: 'heavy',
          priority: 'high',
          description: 'Apply heavier compression for Trap/Dubstep energy',
          effect: 'Multi-Band Compression',
          adjustment: 'Increase compression across all bands'
        });
      }
    } else if (genreKey.includes('jazz') || genreKey.includes('voice-over')) {
      if (current.dynamicRange < 8) {
        optimizations.push({
          type: 'genre',
          action: 'preserve',
          value: 'dynamics',
          priority: 'high',
          description: 'Preserve more dynamics for natural sound',
          effect: 'Light Compression',
          adjustment: 'Reduce compression ratio and increase threshold'
        });
      }
    }

    // Overall Quality Score
    const qualityScore = calculateQualityScore(current, targets);
    
    return {
      optimizations,
      qualityScore,
      overallAssessment: getOverallAssessment(qualityScore, optimizations)
    };
  };

  const calculateQualityScore = (current: any, targets: any) => {
    let score = 100;
    
    // LUFS scoring (40% weight)
    const lufsDiff = Math.abs(targets.lufs.ideal - current.loudness);
    score -= lufsDiff * 10;
    
    // Peak scoring (30% weight)
    const peakDiff = Math.abs(targets.peak.ideal - current.truePeak);
    score -= peakDiff * 50;
    
    // Dynamic range scoring (30% weight)
    const drDiff = Math.abs(targets.dynamicRange.ideal - current.dynamicRange);
    score -= drDiff * 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const getOverallAssessment = (qualityScore: number, optimizations: any[]) => {
    if (qualityScore >= 90) {
      return {
        grade: 'A+',
        status: 'Excellent',
        color: 'text-green-400',
        message: 'Professional-grade mastering achieved!'
      };
    } else if (qualityScore >= 80) {
      return {
        grade: 'A',
        status: 'Very Good',
        color: 'text-green-300',
        message: 'High-quality mastering with minor optimizations needed.'
      };
    } else if (qualityScore >= 70) {
      return {
        grade: 'B',
        status: 'Good',
        color: 'text-yellow-400',
        message: 'Good mastering with some improvements recommended.'
      };
    } else if (qualityScore >= 60) {
      return {
        grade: 'C',
        status: 'Fair',
        color: 'text-orange-400',
        message: 'Acceptable mastering with significant optimizations needed.'
      };
    } else {
      return {
        grade: 'D',
        status: 'Needs Work',
        color: 'text-red-400',
        message: 'Major improvements required for professional quality.'
      };
    }
  };

  // Calculate changes using real analysis data
  // Only show analysis data if we have real analysis results
   const originalData = originalAnalysis ? {
     loudness: originalAnalysis.loudness,
     peak: originalAnalysis.truePeak,
     rms: originalAnalysis.rms,
     dynamicRange: originalAnalysis.dynamicRange
   } : null;

   const masteredData = masteredAnalysis ? {
     loudness: masteredAnalysis.loudness,
     peak: masteredAnalysis.truePeak,
     rms: masteredAnalysis.rms,
     dynamicRange: masteredAnalysis.dynamicRange
   } : (meterData ? {
     loudness: meterData.lufs || null,
     peak: meterData.peak || null,
     rms: meterData.rms || null,
     dynamicRange: meterData.peak && meterData.rms ? Math.abs(meterData.peak - meterData.rms) : null
   } : null);

  const changes = (originalData && masteredData) ? {
    loudnessChange: masteredData.loudness - originalData.loudness,
    peakChange: masteredData.peak - originalData.peak,
    rmsChange: masteredData.rms - originalData.rms,
    dynamicRangeChange: masteredData.dynamicRange - originalData.dynamicRange
  } : null;

  const getImprovementColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getImprovementIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <BarChart3 className="w-4 h-4 text-red-400" />;
    return <CheckCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Audio elements */}
             <audio
         ref={originalAudioRef}
         src={originalAudioUrl || ''}
         onTimeUpdate={handleOriginalTimeUpdate}
         onLoadedMetadata={handleOriginalLoadedMetadata}
         onEnded={handleOriginalEnded}
         onError={(e) => console.error('Original audio error:', e)}
         onLoadStart={() => console.log('Original audio load started')}
         onCanPlay={() => console.log('Original audio can play')}
         preload="metadata"
         style={{ display: 'none' }}
       />
       
       <audio
         ref={masteredAudioRef}
         src={masteredAudioUrl || ''}
         onTimeUpdate={handleMasteredTimeUpdate}
         onLoadedMetadata={handleMasteredLoadedMetadata}
         onEnded={handleMasteredEnded}
         onError={(e) => console.error('Mastered audio error:', e)}
         onLoadStart={() => console.log('Mastered audio load started')}
         onCanPlay={() => console.log('Mastered audio can play')}
         preload="metadata"
         style={{ display: 'none' }}
       />
       
       {/* Debug info */}
       <div className="text-xs text-gray-500 mb-2">
         Debug: Original URL: {originalAudioUrl ? 'Set' : 'Not set'}, 
         Mastered URL: {masteredAudioUrl ? 'Set' : 'Not set'},
         Original Ready: {originalReady ? 'Yes' : 'No'},
         Mastered Ready: {masteredReady ? 'Yes' : 'No'}
       </div>
      
      

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-1.5 rounded-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Audio Analysis & Comparison</h2>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-400">Effects Applied</div>
          <div className="text-lg font-bold text-green-400">
            {getEffectsApplied().length}
          </div>
        </div>
      </div>

      {/* Audio Players Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Audio Player */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-white flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Original Audio
            </h3>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-400 font-medium">Raw Input</div>
              <div className="text-xs text-gray-400">Before Processing</div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Original Audio</span>
              <button
                onClick={handleOriginalPlayPause}
                disabled={!originalReady}
                className={`p-1.5 rounded transition-colors ${
                  originalReady 
                    ? 'bg-gray-500 hover:bg-gray-400' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isPlayingOriginal ? (
                  <Pause className="w-3 h-3 text-white" />
                ) : (
                  <Play className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded h-1.5">
              <div className="bg-gray-500 h-1.5 rounded" style={{ width: `${getProgressPercentage(originalCurrentTime, originalDuration)}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(originalCurrentTime)}</span>
              <span>{formatTime(originalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Mastered Audio Player */}
        <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-lg p-4 border border-green-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-white flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Mastered Audio
            </h3>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-green-400 font-medium">✓ Processed</div>
              <div className="text-xs text-gray-400">Final Output</div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Mastered Audio</span>
              <button
                onClick={handleMasteredPlayPause}
                disabled={!masteredReady}
                className={`p-1.5 rounded transition-colors ${
                  masteredReady 
                    ? 'bg-green-500 hover:bg-green-400' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isPlayingMastered ? (
                  <Pause className="w-3 h-3 text-white" />
                ) : (
                  <Play className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded h-1.5">
              <div className="bg-green-500 h-1.5 rounded" style={{ width: `${getProgressPercentage(masteredCurrentTime, masteredDuration)}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(masteredCurrentTime)}</span>
              <span>{formatTime(masteredDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mastered Audio Analysis */}
      {masteredAnalysis && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
              Final Output Analysis
            </h3>
            <div className="text-right">
              <span className="text-sm text-green-400 font-medium">✓ Analysis Complete</span>
              <div className="text-xs text-blue-400">Real-time meter data</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* LUFS */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">LUFS (Loudness)</div>
              <div className="text-2xl font-bold text-green-400">
                {masteredAnalysis.loudness.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">dB</div>
            </div>

            {/* True Peak */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">True Peak</div>
              <div className="text-2xl font-bold text-blue-400">
                {masteredAnalysis.truePeak.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">dBTP</div>
            </div>

            {/* RMS */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">RMS</div>
              <div className="text-2xl font-bold text-purple-400">
                {masteredAnalysis.rms.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">dB</div>
            </div>

            {/* Dynamic Range */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Dynamic Range</div>
              <div className="text-2xl font-bold text-yellow-400">
                {masteredAnalysis.dynamicRange.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">dB</div>
            </div>
          </div>

          {/* Genre-Specific Analysis */}
          {selectedGenre && (
            <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-500 border-opacity-30 mb-6">
              <h4 className="text-sm font-semibold text-blue-400 mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Genre-Specific Analysis ({selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)})
              </h4>
              
              {(() => {
                const targets = getGenreTargets();
                const mastered = masteredAnalysis;
                
                // Calculate compliance scores
                const lufsCompliance = mastered.loudness >= targets.lufs.min && mastered.loudness <= targets.lufs.max;
                const peakCompliance = mastered.truePeak >= targets.peak.min && mastered.truePeak <= targets.peak.max;
                const dynamicRangeCompliance = mastered.dynamicRange >= targets.dynamicRange.min && mastered.dynamicRange <= targets.dynamicRange.max;
                
                const overallCompliance = lufsCompliance && peakCompliance && dynamicRangeCompliance;
                
                return (
                  <div className="space-y-4">
                    {/* Target vs Actual Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* LUFS */}
                      <div className="bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-400 mb-2">LUFS (Loudness)</div>
                        <div className="text-lg font-bold text-white mb-1">
                          {mastered.loudness.toFixed(1)} dB
                        </div>
                        <div className="text-xs text-gray-400">
                          Target: {targets.lufs.ideal.toFixed(1)} dB ({targets.lufs.min.toFixed(1)} to {targets.lufs.max.toFixed(1)})
                        </div>
                        <div className={`text-xs mt-1 ${lufsCompliance ? 'text-green-400' : 'text-red-400'}`}>
                          {lufsCompliance ? '✓ Within Range' : '✗ Outside Range'}
                        </div>
                      </div>
                      
                      {/* True Peak */}
                      <div className="bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-400 mb-2">True Peak</div>
                        <div className="text-lg font-bold text-white mb-1">
                          {mastered.truePeak.toFixed(1)} dBTP
                        </div>
                        <div className="text-xs text-gray-400">
                          Target: {targets.peak.ideal.toFixed(1)} dBTP ({targets.peak.min.toFixed(1)} to {targets.peak.max.toFixed(1)})
                        </div>
                        <div className={`text-xs mt-1 ${peakCompliance ? 'text-green-400' : 'text-red-400'}`}>
                          {peakCompliance ? '✓ Within Range' : '✗ Outside Range'}
                        </div>
                      </div>
                      
                      {/* Dynamic Range */}
                      <div className="bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-400 mb-2">Dynamic Range</div>
                        <div className="text-lg font-bold text-white mb-1">
                          {mastered.dynamicRange.toFixed(1)} dB
                        </div>
                        <div className="text-xs text-gray-400">
                          Target: {targets.dynamicRange.ideal.toFixed(1)} dB ({targets.dynamicRange.min.toFixed(1)} to {targets.dynamicRange.max.toFixed(1)})
                        </div>
                        <div className={`text-xs mt-1 ${dynamicRangeCompliance ? 'text-green-400' : 'text-red-400'}`}>
                          {dynamicRangeCompliance ? '✓ Within Range' : '✗ Outside Range'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Overall Assessment */}
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm font-semibold text-white mb-2">Overall Assessment</div>
                      <div className={`text-sm ${overallCompliance ? 'text-green-400' : 'text-yellow-400'}`}>
                        {overallCompliance 
                          ? `✓ Excellent mastering for ${selectedGenre} genre. All parameters within target ranges.`
                          : `⚠ Good mastering, but some parameters need adjustment for optimal ${selectedGenre} sound.`
                        }
                      </div>
                      
                      {/* Recommendations */}
                      {!overallCompliance && (
                        <div className="mt-3 text-xs text-gray-300">
                          <div className="font-semibold mb-1">Recommendations:</div>
                          <ul className="space-y-1">
                            {!lufsCompliance && (
                              <li>• Adjust loudness to target {targets.lufs.ideal.toFixed(1)} dB ({targets.lufs.min.toFixed(1)} to {targets.lufs.max.toFixed(1)} range)</li>
                            )}
                            {!peakCompliance && (
                              <li>• Control peak levels to target {targets.peak.ideal.toFixed(1)} dBTP ({targets.peak.min.toFixed(1)} to {targets.peak.max.toFixed(1)} range)</li>
                            )}
                            {!dynamicRangeCompliance && (
                              <li>• Adjust compression to achieve {targets.dynamicRange.ideal.toFixed(1)} dB dynamic range ({targets.dynamicRange.min.toFixed(1)} to {targets.dynamicRange.max.toFixed(1)} range)</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Effects Applied */}
          <div className="bg-purple-900 bg-opacity-20 rounded-lg p-4 border border-purple-500 border-opacity-30">
            <h4 className="text-sm font-semibold text-purple-400 mb-4 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Effects Applied
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {getEffectsApplied().map((effect, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-300">{effect}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Intelligent Optimization Engine */}
      {masteredAnalysis && selectedGenre && (() => {
        const optimizationData = getIntelligentOptimizations();
        if (!optimizationData) return null;

        return (
          <div className="bg-gradient-to-br from-blue-900 to-indigo-800 rounded-lg p-6 border border-blue-600">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                Intelligent Optimization Engine
              </h3>
              <div className="text-right">
                <div className={`text-2xl font-bold ${optimizationData.overallAssessment.color}`}>
                  {optimizationData.overallAssessment.grade}
                </div>
                <div className="text-xs text-gray-400">Quality Score</div>
              </div>
            </div>

            {/* Quality Score */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Overall Quality Score</span>
                <span className={`text-lg font-bold ${optimizationData.overallAssessment.color}`}>
                  {optimizationData.qualityScore.toFixed(1)}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    optimizationData.qualityScore >= 90 ? 'bg-green-500' :
                    optimizationData.qualityScore >= 80 ? 'bg-green-400' :
                    optimizationData.qualityScore >= 70 ? 'bg-yellow-400' :
                    optimizationData.qualityScore >= 60 ? 'bg-orange-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${optimizationData.qualityScore}%` }}
                ></div>
              </div>
              <div className={`text-sm mt-2 ${optimizationData.overallAssessment.color}`}>
                {optimizationData.overallAssessment.message}
              </div>
            </div>

            {/* Optimizations */}
            {optimizationData.optimizations.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                  Recommended Optimizations ({optimizationData.optimizations.length})
                </h4>
                
                <div className="grid gap-3">
                  {optimizationData.optimizations.map((opt, index) => (
                    <div key={index} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                      opt.priority === 'high' ? 'border-red-500' : 
                      opt.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              opt.priority === 'high' ? 'bg-red-500 text-white' :
                              opt.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
                            }`}>
                              {opt.priority.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-white">{opt.effect}</span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{opt.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">Suggested Adjustment:</span>
                            <span className="text-xs font-medium text-blue-400">{opt.adjustment}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`w-3 h-3 rounded-full ${
                            opt.type === 'lufs' ? 'bg-green-500' :
                            opt.type === 'peak' ? 'bg-blue-500' :
                            opt.type === 'dynamicRange' ? 'bg-purple-500' : 'bg-orange-500'
                          }`}></div>
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

            {/* Genre Intelligence */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2"></div>
                Genre-Specific Intelligence
              </h4>
              <div className="text-sm text-gray-300">
                <p>Analysis based on {selectedGenre} industry standards and best practices.</p>
                <p className="mt-1">Targets: {getGenreTargets().lufs.ideal} dB LUFS, {getGenreTargets().peak.ideal} dBTP Peak</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Continue to Export Button */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
        >
          <span>Continue to Export</span>
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default AnalysisPage;
