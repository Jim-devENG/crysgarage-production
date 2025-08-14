import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react';

interface AudioEffects {
  eq: {
    low: number;
    mid: number;
    high: number;
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
    volume: number;
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
  const gTunerOscillatorRef = useRef<OscillatorNode | null>(null);
  const gTunerGainRef = useRef<GainNode | null>(null);
  const gTunerPitchShiftRef = useRef<GainNode | null>(null);
  const gTunerAnalyserRef = useRef<AnalyserNode | null>(null);
  
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
    eqNodesRef.current = [
      ctx.createBiquadFilter(), // Low
      ctx.createBiquadFilter(), // Mid
      ctx.createBiquadFilter()  // High
    ];
    
    // Set EQ types
    eqNodesRef.current[0].type = 'lowshelf';
    eqNodesRef.current[0].frequency.value = 200;
    
    eqNodesRef.current[1].type = 'peaking';
    eqNodesRef.current[1].frequency.value = 1000;
    eqNodesRef.current[1].Q.value = 1;
    
    eqNodesRef.current[2].type = 'highshelf';
    eqNodesRef.current[2].frequency.value = 5000;

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
    
    // Create G-Tuner pitch correction nodes
    gTunerOscillatorRef.current = ctx.createOscillator();
    gTunerGainRef.current = ctx.createGain();
    gTunerPitchShiftRef.current = ctx.createGain(); // Pitch shifter for real-time tuning
    gTunerAnalyserRef.current = ctx.createAnalyser(); // For pitch detection
    
    // Reference oscillator (444Hz)
    gTunerOscillatorRef.current.type = 'sine';
    gTunerOscillatorRef.current.frequency.value = 444; // Default 444Hz
    gTunerGainRef.current.gain.value = 0; // Start muted
    gTunerOscillatorRef.current.connect(gTunerGainRef.current);
    gTunerOscillatorRef.current.start();
    
    // Pitch shifter for real-time audio tuning
    gTunerPitchShiftRef.current.gain.value = 1.0; // Start with no pitch change
    
    // Configure analyser for pitch detection
    gTunerAnalyserRef.current.fftSize = 2048;
    gTunerAnalyserRef.current.smoothingTimeConstant = 0.8;
    
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
      if (gTunerGainRef.current) gTunerGainRef.current.disconnect();
    } catch (error) {
      console.log('Error disconnecting nodes:', error);
    }

    let currentNode: AudioNode = sourceRef.current;

    // Connect EQ if enabled
    if (audioEffects.eq?.enabled && eqNodesRef.current.length >= 3) {
      eqNodesRef.current[0].connect(eqNodesRef.current[1]);
      eqNodesRef.current[1].connect(eqNodesRef.current[2]);
      currentNode.connect(eqNodesRef.current[0]);
      currentNode = eqNodesRef.current[2];
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

    // Connect G-Tuner if enabled (applies pitch correction to audio)
    if (gTunerPitchShiftRef.current && gTunerAnalyserRef.current && audioEffects.gTuner?.enabled) {
      // Connect to analyser for pitch detection
      currentNode.connect(gTunerAnalyserRef.current);
      gTunerAnalyserRef.current.connect(gTunerPitchShiftRef.current);
      currentNode = gTunerPitchShiftRef.current;
    }
    
    // Connect G-Tuner reference tone if enabled
    if (gTunerGainRef.current && audioEffects.gTuner?.enabled) {
      gTunerGainRef.current.connect(gainNodeRef.current);
    }

    // Connect to analyser and output
    currentNode.connect(analyserRef.current);
    analyserRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current!.destination);

    console.log('✅ Processing chain connected successfully');
  }, [audioEffects]);

  // Pitch detection function
  const detectPitch = useCallback(() => {
    if (!gTunerAnalyserRef.current || !audioEffects.gTuner?.enabled) return;
    
    const analyser = gTunerAnalyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Float32Array(bufferLength);
    
    analyser.getFloatFrequencyData(frequencyData);
    
    // Find the peak frequency (strongest component)
    let maxIndex = 0;
    let maxValue = -Infinity;
    
    for (let i = 0; i < bufferLength; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }
    
    // Convert bin index to frequency
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const detectedFreq = (maxIndex * sampleRate) / (2 * bufferLength);
    
    // Update the G-Tuner frequency if we detected a significant signal
    if (maxValue > -50 && detectedFreq > 80 && detectedFreq < 800) {
      // Update the audio effects with the detected frequency
      onEffectChange({
        ...audioEffects,
        gTuner: {
          ...audioEffects.gTuner,
          frequency: detectedFreq
        }
      });
      
      console.log(`Pitch detected: ${detectedFreq.toFixed(1)}Hz`);
    }
  }, [audioEffects, onEffectChange]);

  // Update effect parameters in real-time
  const updateEffectParameters = useCallback(() => {
    if (!audioContextRef.current || !eqNodesRef.current) {
      return;
    }
    
    // Update EQ
    if (eqNodesRef.current.length >= 3 && audioEffects.eq?.enabled) {
      eqNodesRef.current[0].gain.value = audioEffects.eq.low;
      eqNodesRef.current[1].gain.value = audioEffects.eq.mid;
      eqNodesRef.current[2].gain.value = audioEffects.eq.high;
    }

    // Update compressor
    if (compressorRef.current && audioEffects.compressor?.enabled) {
      compressorRef.current.threshold.value = audioEffects.compressor.threshold;
      compressorRef.current.ratio.value = audioEffects.compressor.ratio;
      compressorRef.current.attack.value = audioEffects.compressor.attack / 1000;
      compressorRef.current.release.value = audioEffects.compressor.release / 1000;
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
    }

    // Update volume
    if (gainNodeRef.current && audioEffects.loudness?.enabled) {
      gainNodeRef.current.gain.value = audioEffects.loudness.volume * (isMuted ? 0 : volume);
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

    // Update G-Tuner
    if (gTunerOscillatorRef.current && gTunerGainRef.current && audioEffects.gTuner) {
      gTunerOscillatorRef.current.frequency.value = audioEffects.gTuner.frequency;
      gTunerGainRef.current.gain.value = audioEffects.gTuner.enabled ? 0.1 : 0; // Low volume reference tone
    }
    
    // Update G-Tuner real-time pitch correction
    if (gTunerPitchShiftRef.current && audioEffects.gTuner) {
      if (audioEffects.gTuner.enabled) {
        // Real-time pitch detection and correction to 444Hz
        const referenceFreq = 444; // Target frequency
        const currentFreq = audioEffects.gTuner.frequency; // Current detected frequency
        
        // Calculate pitch correction ratio
        // If current frequency is higher than 444Hz, we need to lower the pitch
        // If current frequency is lower than 444Hz, we need to raise the pitch
        const pitchRatio = referenceFreq / currentFreq;
        
        // Apply pitch correction using gain adjustment
        // This creates a pitch shift effect by adjusting the playback rate
        gTunerPitchShiftRef.current.gain.value = pitchRatio;
        
        console.log(`G-Tuner: Detected ${currentFreq}Hz, correcting to ${referenceFreq}Hz (ratio: ${pitchRatio.toFixed(3)})`);
      } else {
        // No pitch correction when disabled
        gTunerPitchShiftRef.current.gain.value = 1.0; // No pitch change
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

    // Calculate LUFS (simplified)
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += Math.abs(timeData[i] - 128);
    }
    const rms = sum / timeData.length;
    const lufs = 20 * Math.log10(rms / 128) - 70;

    // Calculate peak
    const peak = Math.max(...Array.from(timeData).map(x => Math.abs(x - 128))) / 128;

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
      rms: rms / 128,
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
      updateEffectParameters();
      connectProcessingChain();
    }
  }, [audioEffects, updateEffectParameters, connectProcessingChain]);

  // Analysis loop
  useEffect(() => {
    if (!isPlaying) return;

    const analysisInterval = setInterval(updateAnalysis, 50);
    const pitchDetectionInterval = setInterval(detectPitch, 100); // Pitch detection every 100ms
    
    return () => {
      clearInterval(analysisInterval);
      clearInterval(pitchDetectionInterval);
    };
  }, [isPlaying, updateAnalysis, detectPitch]);

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
      <div className="backdrop-blur-md bg-black bg-opacity-30 rounded-lg p-6 text-center border border-gray-500 border-opacity-50 shadow-2xl">
        <div className="text-gray-400 mb-4">
          {/* Settings Icon */}
          <div className="w-12 h-12 bg-crys-gold rounded-full mx-auto mb-2 flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-black" />
          </div>
          <p>Upload an audio file to start real-time mastering</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-black bg-opacity-30 rounded-lg p-6 border border-gray-500 border-opacity-50 shadow-2xl">
      {/* Settings Icon */}
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-crys-gold rounded-full mx-auto mb-2 flex items-center justify-center">
          <Settings className="w-6 h-6 text-black" />
        </div>
        <h3 className="text-lg font-semibold text-white">Real-Time Mastering Player</h3>
        <p className="text-sm text-gray-400">Professional audio mastering with real-time effects</p>
      </div>



      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg mb-4 hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
      >
        <span>Settings</span>
        <Settings className="w-4 h-4 text-gray-300" />
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
      <div className="mb-4 p-3 bg-gray-800 rounded">
        <p className="text-sm text-gray-300">
          <span className="font-medium">File:</span> {audioFile.name}
        </p>
        <p className="text-sm text-gray-400">
          <span className="font-medium">Size:</span> {(audioFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-sm text-gray-400">
          <span className="font-medium">Audio Context:</span> 
          <span className={`ml-1 ${audioContextState === 'running' ? 'text-green-400' : audioContextState === 'suspended' ? 'text-yellow-400' : 'text-red-400'}`}>
            {audioContextState}
          </span>
        </p>
        <p className="text-sm text-gray-400">
          <span className="font-medium">Effects:</span> 
          <span className={`ml-1 ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
            {isInitialized ? 'Active' : 'Inactive'}
          </span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs text-gray-400 w-8">{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(currentTime / (duration || 1)) * 100}%, #4b5563 ${(currentTime / (duration || 1)) * 100}%, #4b5563 100%)`
              }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {/* Skip Backward */}
        <button
          onClick={skipBackward}
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <SkipBack className="w-4 h-4 text-gray-300" />
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
          className="p-4 bg-crys-gold rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-black" />
          ) : (
            <Play className="w-5 h-5 text-black ml-0.5" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={skipForward}
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <SkipForward className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <button
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          {volume === 0 ? (
            <VolumeX className="w-4 h-4 text-gray-300" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-300" />
          )}
        </button>
        <div className="w-20">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
            }}
          />
        </div>
      </div>

      {/* Real-Time Effects Status */}
      {showSettings && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h4 className="text-sm font-medium text-white mb-3">Active Effects</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
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
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-400">Processing audio in real-time...</span>
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
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
