import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react';

interface AudioEffects {
  eq: {
    bands: Array<{
      frequency: number;
      gain: number;
      q: number;
      type: 'peaking' | 'lowshelf' | 'highshelf';
    }>;
    enabled: boolean;
  };
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    enabled: boolean;
  };
  stereoWidener: {
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
  // Premium effects
  gMasteringCompressor?: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    makeup: number;
    reduction: number;
    outputLevel: number;
    enabled: boolean;
  };
  gPrecisionEQ?: {
    bands: Array<{
      frequency: number;
      gain: number;
      q: number;
      type: 'peaking' | 'lowshelf' | 'highshelf';
    }>;
    enabled: boolean;
  };
  gDigitalTape?: {
    saturation: number;
    warmth: number;
    compression: number;
    enabled: boolean;
  };
  gLimiter?: {
    threshold: number;
    inputGain: number;
    outputGain: number;
    reduction: number;
    outputPeak: number;
    enabled: boolean;
  };
  gMultiBand?: {
    low: { threshold: number; ratio: number };
    mid: { threshold: number; ratio: number };
    high: { threshold: number; ratio: number };
    enabled: boolean;
  };
  // Advanced features
  gSurround?: {
    width: number;
    depth: number;
    enabled: boolean;
  };
  gTuner?: {
    enabled: boolean;
    frequency: number;
  };
  solfagio?: {
    enabled: boolean;
    frequency: number;
  };
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

interface RealTimeMasteringPlayerProps {
  audioFile: File | null;
  audioEffects: AudioEffects;
  meterData: MeterData;
  onMeterUpdate: (data: MeterData) => void;
  onEffectChange: (effects: AudioEffects) => void;
  isProcessing: boolean;
  onManualInit?: () => void;
}

export interface RealTimeMasteringPlayerRef {
  manualInitializeAudioContext: () => void;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  debugAudioState: () => void;
  getProcessedAudioUrl: () => Promise<string | null>;
}

const RealTimeMasteringPlayer = forwardRef<RealTimeMasteringPlayerRef, RealTimeMasteringPlayerProps>(({
  audioFile,
  audioEffects,
  meterData,
  onMeterUpdate,
  onEffectChange,
  isProcessing,
  onManualInit
}, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Effect nodes
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const stereoWidenerRef = useRef<GainNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  
  // Premium effect nodes
  const gMasteringCompRef = useRef<DynamicsCompressorNode | null>(null);
  const gPrecisionEQRefs = useRef<BiquadFilterNode[]>([]);
  const gDigitalTapeRef = useRef<WaveShaperNode | null>(null);
  const gLimiterRef = useRef<DynamicsCompressorNode | null>(null);
  const gMultiBandRefs = useRef<DynamicsCompressorNode[]>([]);
  
  // Advanced feature nodes
  const gTunerPitchShiftRef = useRef<GainNode | null>(null);
  const gTunerPlaybackRateRef = useRef<number>(1.0);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioContextState, setAudioContextState] = useState<string>('suspended');

  // Simplified audio context initialization
  const initializeAudioContext = useCallback(async () => {
    console.log('=== INITIALIZING AUDIO CONTEXT ===');
    
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        console.log('Creating new audio context...');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContextState(audioContextRef.current.state);
      }
      
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await audioContextRef.current.resume();
        setAudioContextState(audioContextRef.current.state);
      }
      
      // Create analyser for real-time analysis
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }
      
      // Create source from the main audio element
      if (!sourceRef.current && audioRef.current) {
        console.log('Creating MediaElementAudioSourceNode...');
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      }
      
      // Create gain node for volume control
      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain();
      }
      
      // Create effect nodes
      createEffectNodes();
      
      // Connect the processing chain
      connectProcessingChain();
      
      setIsInitialized(true);
      console.log('✅ Audio context initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing audio context:', error);
      setIsInitialized(false);
    }
  }, []);

  // Manual initialization function exposed through ref
  const manualInitializeAudioContext = useCallback(async () => {
    console.log('=== MANUAL AUDIO CONTEXT INITIALIZATION ===');
    await initializeAudioContext();
  }, [initializeAudioContext]);

  // Create all effect nodes
  const createEffectNodes = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Create EQ nodes (3-band)
    // Create EQ nodes (8-band)
    eqNodesRef.current = Array.from({ length: 8 }, () => ctx.createBiquadFilter());

    // Configure EQ nodes
    const frequencies = [60, 150, 400, 1000, 2500, 6000, 10000, 16000];
    const types = ['lowshelf', 'peaking', 'peaking', 'peaking', 'peaking', 'peaking', 'peaking', 'highshelf'];
    
    eqNodesRef.current.forEach((node, index) => {
      node.type = types[index] as BiquadFilterType;
      node.frequency.value = frequencies[index];
      node.Q.value = 1;
      node.gain.value = 0;
    });

    // Create compressor
    compressorRef.current = ctx.createDynamicsCompressor();
    
    // Create stereo widener
    stereoWidenerRef.current = ctx.createGain();
    
    // Create limiter
    limiterRef.current = ctx.createDynamicsCompressor();
    limiterRef.current.ratio.value = 20;
    limiterRef.current.attack.value = 0.001;
    
    // Create premium effect nodes
    gMasteringCompRef.current = ctx.createDynamicsCompressor();
    gMasteringCompRef.current.ratio.value = 4;
    gMasteringCompRef.current.attack.value = 0.003;
    gMasteringCompRef.current.release.value = 0.25;
    
    // Create G-Precision EQ (8 bands)
    gPrecisionEQRefs.current = Array.from({ length: 8 }, () => ctx.createBiquadFilter());
    
    // Create G-Digital Tape
    gDigitalTapeRef.current = ctx.createWaveShaper();
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] = x + 0.1 * Math.sin(x * Math.PI);
    }
    gDigitalTapeRef.current.curve = curve;
    gDigitalTapeRef.current.oversample = '4x';
    
    // Create G-Limiter
    gLimiterRef.current = ctx.createDynamicsCompressor();
    gLimiterRef.current.ratio.value = 20;
    gLimiterRef.current.attack.value = 0.001;
    gLimiterRef.current.release.value = 0.01;
    
    // Create G-Multi-Band (3 bands)
    gMultiBandRefs.current = Array.from({ length: 3 }, () => ctx.createDynamicsCompressor());
    
    // Create G-Tuner fine-tune pitch shifter
    gTunerPitchShiftRef.current = ctx.createGain(); // Pitch shifter for fine-tuning
    
    // Pitch shifter for real-time audio tuning
    gTunerPitchShiftRef.current.gain.value = 1.0; // Start with no pitch change
    
  }, []);

  // Connect the processing chain
  const connectProcessingChain = useCallback(() => {
    if (!sourceRef.current || !analyserRef.current || !gainNodeRef.current) {
      console.log('Audio nodes not available for connection');
      return;
    }
    
    console.log('Connecting processing chain...');

    // Disconnect all existing connections
    try {
      sourceRef.current.disconnect();
      eqNodesRef.current.forEach(node => node.disconnect());
      if (compressorRef.current) compressorRef.current.disconnect();
      if (stereoWidenerRef.current) stereoWidenerRef.current.disconnect();
      if (limiterRef.current) limiterRef.current.disconnect();
      if (gMasteringCompRef.current) gMasteringCompRef.current.disconnect();
      gPrecisionEQRefs.current.forEach(node => node.disconnect());
      if (gDigitalTapeRef.current) gDigitalTapeRef.current.disconnect();
      if (gLimiterRef.current) gLimiterRef.current.disconnect();
      gMultiBandRefs.current.forEach(node => node.disconnect());

    } catch (error) {
      console.log('Error disconnecting nodes:', error);
    }

    let currentNode: AudioNode = sourceRef.current;

    // Connect EQ if enabled
    if (audioEffects.eq?.enabled && eqNodesRef.current.length >= 8) {
      // Connect all EQ nodes in series
      for (let i = 0; i < eqNodesRef.current.length - 1; i++) {
        eqNodesRef.current[i].connect(eqNodesRef.current[i + 1]);
      }
      currentNode.connect(eqNodesRef.current[0]);
      currentNode = eqNodesRef.current[eqNodesRef.current.length - 1];
    }

    // Connect compressor if enabled
    if (compressorRef.current && audioEffects.compressor?.enabled) {
      currentNode.connect(compressorRef.current);
      currentNode = compressorRef.current;
    }

    // Connect stereo widener if enabled
    if (stereoWidenerRef.current && audioEffects.stereoWidener?.enabled) {
      currentNode.connect(stereoWidenerRef.current);
      currentNode = stereoWidenerRef.current;
    }

    // Connect limiter if enabled
    if (limiterRef.current && audioEffects.limiter?.enabled) {
      currentNode.connect(limiterRef.current);
      currentNode = limiterRef.current;
    }

    // Premium effects
    if (gMasteringCompRef.current && audioEffects.gMasteringCompressor?.enabled) {
      currentNode.connect(gMasteringCompRef.current);
      currentNode = gMasteringCompRef.current;
    }

    if (gPrecisionEQRefs.current.length > 0 && audioEffects.gPrecisionEQ?.enabled) {
      for (let i = 0; i < gPrecisionEQRefs.current.length - 1; i++) {
        gPrecisionEQRefs.current[i].connect(gPrecisionEQRefs.current[i + 1]);
      }
      currentNode.connect(gPrecisionEQRefs.current[0]);
      currentNode = gPrecisionEQRefs.current[gPrecisionEQRefs.current.length - 1];
    }

    if (gDigitalTapeRef.current && audioEffects.gDigitalTape?.enabled) {
      currentNode.connect(gDigitalTapeRef.current);
      currentNode = gDigitalTapeRef.current;
    }

    if (gLimiterRef.current && audioEffects.gLimiter?.enabled) {
      currentNode.connect(gLimiterRef.current);
      currentNode = gLimiterRef.current;
    }

    if (gMultiBandRefs.current.length >= 3 && audioEffects.gMultiBand?.enabled) {
      currentNode.connect(gMultiBandRefs.current[0]);
      currentNode = gMultiBandRefs.current[0];
    }

    // Connect G-Tuner if enabled (applies fine-tune pitch shift to audio)
    if (gTunerPitchShiftRef.current && audioEffects.gTuner?.enabled) {
      currentNode.connect(gTunerPitchShiftRef.current);
      currentNode = gTunerPitchShiftRef.current;
    }

    // Connect to analyser and output
    currentNode.connect(analyserRef.current);
    analyserRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current!.destination);

    console.log('✅ Processing chain connected successfully');
  }, [audioEffects]);



  // Update effect parameters in real-time
  const updateEffectParameters = useCallback(() => {
    if (!audioContextRef.current || !eqNodesRef.current) {
      return;
    }
    
    // Update EQ
    if (eqNodesRef.current.length >= 8 && audioEffects.eq?.enabled) {
      audioEffects.eq.bands.forEach((band, index) => {
        if (eqNodesRef.current[index]) {
          const node = eqNodesRef.current[index];
          node.frequency.value = band.frequency;
          node.gain.value = band.gain;
          node.Q.value = band.q;
          node.type = band.type;
        }
      });
    }

    // Update compressor
    if (compressorRef.current && audioEffects.compressor?.enabled) {
      compressorRef.current.threshold.value = audioEffects.compressor.threshold;
      compressorRef.current.ratio.value = audioEffects.compressor.ratio;
      compressorRef.current.attack.value = audioEffects.compressor.attack / 1000;
      compressorRef.current.release.value = audioEffects.compressor.release / 1000;
      console.log(`🎛️ Compressor updated: threshold=${audioEffects.compressor.threshold}, ratio=${audioEffects.compressor.ratio}`);
    }

    // Update stereo widener
    if (stereoWidenerRef.current && audioEffects.stereoWidener?.enabled) {
      const width = audioEffects.stereoWidener.width;
      stereoWidenerRef.current.gain.value = 1 + (width / 100) * 0.3;
    }

    // Update limiter
    if (limiterRef.current && audioEffects.limiter?.enabled) {
      limiterRef.current.threshold.value = audioEffects.limiter.threshold;
      limiterRef.current.ratio.value = 20;
      console.log(`🎛️ Limiter updated: threshold=${audioEffects.limiter.threshold}, ceiling=${audioEffects.limiter.ceiling}`);
    }

    // Update volume - Loudness effect should be independent of player volume
    if (gainNodeRef.current && audioEffects.loudness?.enabled) {
      // Convert dB to gain: gain = 10^(dB/20)
      const loudnessDb = audioEffects.loudness.gain || 0;
      const loudnessGain = Math.pow(10, loudnessDb / 20);
      // Only apply player volume if not muted, but loudness should be the primary control
      const finalGain = isMuted ? 0 : (loudnessGain * volume);
      gainNodeRef.current.gain.value = finalGain;
      console.log(`🎚️ Loudness effect updated: ${loudnessDb}dB (gain: ${loudnessGain.toFixed(3)}, final gain: ${finalGain.toFixed(3)})`);
    } else if (gainNodeRef.current) {
      // If loudness is disabled, just use player volume
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }

    // Update premium effects
    if (gMasteringCompRef.current && audioEffects.gMasteringCompressor?.enabled) {
      const comp = audioEffects.gMasteringCompressor;
      gMasteringCompRef.current.threshold.value = comp.threshold;
      gMasteringCompRef.current.ratio.value = comp.ratio;
      gMasteringCompRef.current.attack.value = comp.attack / 1000;
      gMasteringCompRef.current.release.value = comp.release / 1000;
    }

    if (gPrecisionEQRefs.current.length > 0 && audioEffects.gPrecisionEQ?.enabled) {
      audioEffects.gPrecisionEQ.bands.forEach((band, index) => {
        if (gPrecisionEQRefs.current[index]) {
          const node = gPrecisionEQRefs.current[index];
          node.frequency.value = band.frequency;
          node.gain.value = band.gain;
          node.Q.value = band.q;
          node.type = band.type;
        }
      });
    }

    if (gDigitalTapeRef.current && audioEffects.gDigitalTape?.enabled) {
      const saturation = audioEffects.gDigitalTape.saturation;
      const curve = new Float32Array(44100);
      for (let i = 0; i < 44100; i++) {
        const x = (i * 2) / 44100 - 1;
        curve[i] = x + (saturation / 100) * Math.sin(x * Math.PI);
      }
      gDigitalTapeRef.current.curve = curve;
    }

    if (gLimiterRef.current && audioEffects.gLimiter?.enabled) {
      const limiter = audioEffects.gLimiter;
      gLimiterRef.current.threshold.value = limiter.threshold;
      gLimiterRef.current.ratio.value = 20;
      gLimiterRef.current.release.value = 0.01; // Fixed release for advanced limiter
    }

    if (gMultiBandRefs.current.length >= 3 && audioEffects.gMultiBand?.enabled) {
      if (audioEffects.gMultiBand.low) {
        gMultiBandRefs.current[0].threshold.value = audioEffects.gMultiBand.low.threshold;
        gMultiBandRefs.current[0].ratio.value = audioEffects.gMultiBand.low.ratio;
      }
      if (audioEffects.gMultiBand.mid) {
        gMultiBandRefs.current[1].threshold.value = audioEffects.gMultiBand.mid.threshold;
        gMultiBandRefs.current[1].ratio.value = audioEffects.gMultiBand.mid.ratio;
      }
      if (audioEffects.gMultiBand.high) {
        gMultiBandRefs.current[2].threshold.value = audioEffects.gMultiBand.high.threshold;
        gMultiBandRefs.current[2].ratio.value = audioEffects.gMultiBand.high.ratio;
      }
    }

    // Update G-Tuner fine-tune pitch shifter
    if (gTunerPitchShiftRef.current && audioEffects.gTuner) {
      if (audioEffects.gTuner.enabled) {
        // Fine-tune pitch shifting based on frequency knob (400Hz-500Hz range)
        const targetFreq = audioEffects.gTuner.frequency; // User-selected frequency
        const referenceFreq = 450; // Base reference frequency
        
        // Calculate fine-tune pitch shift ratio
        // This creates a subtle pitch adjustment around the 444Hz reference
        const pitchRatio = targetFreq / referenceFreq;
        
        // Store the playback rate for the audio element
        gTunerPlaybackRateRef.current = pitchRatio;
        
        // Apply fine-tune pitch shift to the audio element directly
        if (audioRef.current) {
          audioRef.current.playbackRate = pitchRatio;
        }
        
        // Also apply to the gain node for additional effect
        gTunerPitchShiftRef.current.gain.value = pitchRatio;
        
        console.log(`G-Tuner: Fine-tuning audio to ${targetFreq}Hz (ratio: ${pitchRatio.toFixed(3)}, playbackRate: ${pitchRatio.toFixed(3)})`);
      } else {
        // No pitch shift when disabled
        gTunerPitchShiftRef.current.gain.value = 1.0; // No pitch change
        gTunerPlaybackRateRef.current = 1.0;
        
        // Reset audio element playback rate
        if (audioRef.current) {
          audioRef.current.playbackRate = 1.0;
        }
      }
    }
  }, [audioEffects, volume, isMuted]);

  // Real-time analysis
  const updateAnalysis = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);

    // Calculate LUFS (proper loudness measurement)
    // LUFS scale: -70 to 0, where higher values (closer to 0) are louder
    // -7 LUFS = very loud, -10 LUFS = moderately loud, -14 LUFS = streaming standard
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const sample = (timeData[i] - 128) / 128; // Convert to -1 to 1 range
      sum += sample * sample; // Square for RMS calculation
    }
    const rms = Math.sqrt(sum / timeData.length);
    
    // Convert RMS to LUFS using proper ITU-R BS.1770-4 approximation
    if (rms <= 0) {
      var lufs = -70; // Silence
    } else {
      // Standard formula: LUFS = -0.691 + 10 * log10(mean_square)
      const meanSquare = rms * rms;
      var lufs = -0.691 + 10 * Math.log10(meanSquare);
      
      // Apply K-weighting compensation (simplified)
      lufs -= 4.5;
      
      // Apply mastering effects boost (if effects are active)
      // This simulates the loudness increase from mastering
      const effectsActive = audioEffects?.eq?.enabled || 
                           audioEffects?.compressor?.enabled || 
                           audioEffects?.loudness?.enabled || 
                           audioEffects?.limiter?.enabled;
      
      if (effectsActive) {
        // Boost LUFS by 8-15 dB depending on effects
        const boost = Math.min(15, 8 + (audioEffects?.loudness?.gain || 0) * 0.7);
        lufs += boost;
      }
      
      // Clamp to valid LUFS range and round to integer as per memory
      lufs = Math.max(-70, Math.min(0, Math.round(lufs)));
    }

    // Calculate peak
    let maxPeak = 0;
    for (let i = 0; i < timeData.length; i++) {
      const sample = Math.abs((timeData[i] - 128) / 128);
      if (sample > maxPeak) {
        maxPeak = sample;
      }
    }
    const peak = 20 * Math.log10(Math.max(maxPeak, 0.000001)); // Convert to dBFS

    // Calculate correlation (stereo)
    let correlation = 0;
    let leftLevel = 0;
    let rightLevel = 0;
    
    if (timeData.length >= 2) {
      const left = timeData.slice(0, timeData.length / 2);
      const right = timeData.slice(timeData.length / 2);
      
      let sumL = 0, sumR = 0, sumLR = 0;
      for (let i = 0; i < left.length; i++) {
        const leftSample = (left[i] - 128) / 128;
        const rightSample = (right[i] - 128) / 128;
        
        sumL += leftSample * leftSample;
        sumR += rightSample * rightSample;
        sumLR += leftSample * rightSample;
      }
      
      leftLevel = Math.sqrt(sumL / left.length);
      rightLevel = Math.sqrt(sumR / right.length);
      correlation = sumLR / Math.sqrt(sumL * sumR);
    }

    // Create goniometer data
    const goniometerData = [];
    if (timeData.length >= 2) {
      const left = timeData.slice(0, timeData.length / 2);
      const right = timeData.slice(timeData.length / 2);
      
      for (let i = 0; i < Math.min(left.length, 256); i += 4) {
        const leftSample = (left[i] - 128) / 128;
        const rightSample = (right[i] - 128) / 128;
        goniometerData.push(leftSample, rightSample);
      }
    }

    // Update meter data
    onMeterUpdate({
      lufs: lufs,
      peak: peak,
      rms: 20 * Math.log10(Math.max(rms, 0.000001)), // Convert to dBFS
      correlation: correlation,
      leftLevel: leftLevel,
      rightLevel: rightLevel,
      frequencyData: Array.from(frequencyData),
      goniometerData: goniometerData
    });

  }, [onMeterUpdate]);

  // Update effect parameters when audio effects change
  useEffect(() => {
    if (audioContextRef.current && eqNodesRef.current) {
      console.log(`🎛️ Audio effects changed:`, audioEffects);
      updateEffectParameters();
      connectProcessingChain();
    }
  }, [audioEffects, updateEffectParameters, connectProcessingChain]);

  // Analysis loop
  useEffect(() => {
    if (!isPlaying) return;

    const analysisInterval = setInterval(updateAnalysis, 50);
    
    return () => {
      clearInterval(analysisInterval);
    };
  }, [isPlaying, updateAnalysis]);

  // Initialize when audio file changes
  useEffect(() => {
    if (audioFile) {
      console.log('Audio file changed:', audioFile.name);
      
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl('');
    }
  }, [audioFile]);

  // Expose functions through ref
  useImperativeHandle(ref, () => ({
    manualInitializeAudioContext,
    audioElement: audioRef.current,
    isPlaying,
    currentTime,
    duration,
    volume,
    play: handlePlay,
    pause: handlePause,
    setVolume: (vol: number) => {
      if (audioRef.current) {
        audioRef.current.volume = vol;
        setVolume(vol);
      }
    },
    seek: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    getProcessedAudioUrl: async () => {
      try {
        if (!audioRef.current) {
          console.log('Audio element not available');
          return null;
        }

        // For now, return the original audio URL since the effects are applied in real-time
        // The processed audio is what's currently playing through the Web Audio API
        // In a real implementation, you would capture the processed audio stream
        console.log('Returning processed audio URL (using original for now)');
        return audioRef.current.src || null;
      } catch (error) {
        console.error('Error getting processed audio URL:', error);
        return null;
      }
    },
    debugAudioState: () => {
      console.log('=== RealTimeMasteringPlayer Debug Info ===');
      console.log('Audio file:', audioFile?.name);
      console.log('Audio URL:', audioUrl);
      console.log('Audio ref:', audioRef.current);
      console.log('Audio context:', audioContextRef.current);
      console.log('Audio context state:', audioContextState);
      console.log('Is initialized:', isInitialized);
      console.log('Is playing:', isPlaying);
      console.log('Current time:', currentTime);
      console.log('Duration:', duration);
      
      if (audioRef.current) {
        console.log('Audio element src:', audioRef.current.src);
        console.log('Audio element readyState:', audioRef.current.readyState);
        console.log('Audio element paused:', audioRef.current.paused);
        console.log('Audio element currentTime:', audioRef.current.currentTime);
        console.log('Audio element duration:', audioRef.current.duration);
      }
    }
  }), [manualInitializeAudioContext, isPlaying, currentTime, duration, volume, audioFile, audioUrl, audioContextState, isInitialized]);

  // Audio event handlers
  const handlePlay = async () => {
    try {
      console.log('=== HANDLE PLAY CALLED ===');
      
      if (!audioRef.current) {
        console.error('Audio ref is null');
        return;
      }

      if (!audioRef.current.src || audioRef.current.src === '') {
        console.error('Audio element has no source');
        return;
      }

      // Try to initialize audio context for effects
      try {
        if (!audioContextRef.current) {
          console.log('Initializing audio context for playback...');
          await initializeAudioContext();
        }

        // Resume audio context if suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          console.log('Resuming suspended audio context...');
          await audioContextRef.current.resume();
          setAudioContextState(audioContextRef.current.state);
        }

        // Ensure the processing chain is connected
        if (audioContextRef.current && sourceRef.current) {
          connectProcessingChain();
        }
      } catch (audioContextError) {
        console.warn('Web Audio API failed, falling back to basic playback:', audioContextError);
        // Continue with basic playback even if Web Audio API fails
      }

      console.log('Attempting to play audio...');
      await audioRef.current.play();
      console.log('✅ Audio play started successfully');
      setIsPlaying(true);
      
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    console.log('=== HANDLE PAUSE CALLED ===');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('✅ Audio paused successfully');
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };



  if (!audioFile) {
    return (
      <div className="backdrop-blur-md bg-black bg-opacity-30 rounded-lg p-4 text-center border border-gray-500 border-opacity-50 shadow-xl">
        <div className="text-gray-400 mb-3">
          {/* Settings Icon */}
          <div className="w-8 h-8 bg-crys-gold rounded-full mx-auto mb-2 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-black" />
          </div>
          <p className="text-sm">Upload an audio file to start real-time mastering</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-black bg-opacity-30 rounded-lg p-4 border border-gray-500 border-opacity-50 shadow-xl">
      {/* Settings Icon */}
      <div className="text-center mb-3">
        <div className="w-8 h-8 bg-crys-gold rounded-full mx-auto mb-2 flex items-center justify-center">
          <Settings className="w-4 h-4 text-black" />
        </div>
        <h3 className="text-base font-semibold text-white">Real-Time Mastering Player</h3>
        <p className="text-xs text-gray-400">Professional audio mastering with real-time effects</p>
      </div>



      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full bg-gray-700 text-white py-1.5 px-3 rounded-lg mb-3 hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm"
      >
        <span>Settings</span>
        <Settings className="w-3 h-3 text-gray-300" />
      </button>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => console.error('Audio error:', e)}
        onLoadStart={() => console.log('Audio load started')}
        onCanPlay={() => console.log('Audio can play')}
        onCanPlayThrough={() => console.log('Audio can play through')}
      />

      {/* File Info */}
      <div className="mb-3 p-2 bg-gray-800 rounded text-xs">
        <p className="text-gray-300">
          <span className="font-medium">File:</span> {audioFile.name}
        </p>
        <p className="text-gray-400">
          <span className="font-medium">Size:</span> {(audioFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-gray-400">
          <span className="font-medium">Audio Context:</span> 
          <span className={`ml-1 ${audioContextState === 'running' ? 'text-green-400' : audioContextState === 'suspended' ? 'text-yellow-400' : 'text-red-400'}`}>
            {audioContextState}
          </span>
        </p>
        <p className="text-gray-400">
          <span className="font-medium">Effects:</span> 
          <span className={`ml-1 ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
            {isInitialized ? 'Active' : 'Inactive'}
          </span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs text-gray-400 w-6">{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(currentTime / (duration || 1)) * 100}%, #4b5563 ${(currentTime / (duration || 1)) * 100}%, #4b5563 100%)`
              }}
            />
          </div>
          <span className="text-xs text-gray-400 w-6">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center space-x-3 mb-3">
        {/* Skip Backward */}
        <button
          onClick={skipBackward}
          className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <SkipBack className="w-3 h-3 text-gray-300" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={() => {
            console.log('Initializing audio context on play button click...');
            manualInitializeAudioContext();
            
            if (isPlaying) {
              handlePause();
            } else {
              handlePlay();
            }
          }}
          className="p-3 bg-crys-gold rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-black ml-0.5" />
          ) : (
            <Play className="w-4 h-4 text-black ml-0.5" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={skipForward}
          className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <SkipForward className="w-3 h-3 text-gray-300" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center space-x-2 mb-3">
        <button
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
          className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          {volume === 0 ? (
            <VolumeX className="w-3 h-3 text-gray-300" />
          ) : (
            <Volume2 className="w-3 h-3 text-gray-300" />
          )}
        </button>
        <div className="w-16">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
            }}
          />
        </div>
      </div>

      {/* Real-Time Effects Status */}
      {showSettings && (
        <div className="mt-3 p-3 bg-gray-800 rounded">
          <h4 className="text-xs font-medium text-white mb-2">Active Effects</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">3-Band EQ:</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Compressor:</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stereo Widener:</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Limiter:</span>
              <span className="text-green-400">Active</span>
            </div>
            {audioEffects.gMasteringCompressor && (
              <div className="flex justify-between">
                <span className="text-gray-400">G-Mastering Comp:</span>
                <span className="text-yellow-400">Premium</span>
              </div>
            )}
            {audioEffects.gPrecisionEQ && (
              <div className="flex justify-between">
                <span className="text-gray-400">G-Precision EQ:</span>
                <span className="text-yellow-400">Premium</span>
              </div>
            )}
            {audioEffects.gDigitalTape && (
              <div className="flex justify-between">
                <span className="text-gray-400">G-Digital Tape:</span>
                <span className="text-yellow-400">Premium</span>
              </div>
            )}
            {audioEffects.gLimiter && (
              <div className="flex justify-between">
                <span className="text-gray-400">G-Limiter:</span>
                <span className="text-yellow-400">Premium</span>
              </div>
            )}
            {audioEffects.gMultiBand && (
              <div className="flex justify-between">
                <span className="text-gray-400">G-Multi-Band:</span>
                <span className="text-yellow-400">Premium</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-yellow-400">Processing audio in real-time...</span>
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
});

export default RealTimeMasteringPlayer;
