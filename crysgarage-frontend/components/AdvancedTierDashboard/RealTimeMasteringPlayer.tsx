import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react';

interface AudioEffects {
  eq: {
    low: number;
    mid: number;
    high: number;
  };
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  stereoWidener: {
    width: number;
  };
  loudness: {
    volume: number;
  };
  limiter: {
    threshold: number;
    ceiling: number;
  };
  // Premium effects
  gMasteringCompressor?: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    makeup: number;
  };
  gPrecisionEQ?: {
    bands: Array<{
      frequency: number;
      gain: number;
      q: number;
      type: 'peaking' | 'lowshelf' | 'highshelf';
    }>;
  };
  gDigitalTape?: {
    saturation: number;
    warmth: number;
    compression: number;
  };
  gLimiter?: {
    threshold: number;
    ceiling: number;
    release: number;
  };
  gMultiBand?: {
    low: { threshold: number; ratio: number };
    mid: { threshold: number; ratio: number };
    high: { threshold: number; ratio: number };
  };
  // Advanced features
  gSurround?: boolean;
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
}

const RealTimeMasteringPlayer: React.FC<RealTimeMasteringPlayerProps> = ({
  audioFile,
  audioEffects,
  meterData,
  onMeterUpdate,
  onEffectChange,
  isProcessing
}) => {
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
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Initialize audio context and processing chain
  const initializeAudioContext = useCallback(() => {
    if (!audioRef.current) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser for real-time analysis
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Create source from audio element
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      // Create gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      
      // Create effect nodes
      createEffectNodes();
      
      // Connect the processing chain
      connectProcessingChain();
      
    } catch (error) {
      console.error('Error initializing audio context:', error);
      // Reset state on error
      setIsPlaying(false);
    }
  }, []);

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
    
    // Create stereo widener (using gain nodes for mid-side processing)
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
    
  }, []);

  // Connect the processing chain - only connect active effects
  const connectProcessingChain = useCallback(() => {
    if (!sourceRef.current || !analyserRef.current || !gainNodeRef.current) return;

    // Disconnect all existing connections
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

    let currentNode: AudioNode = sourceRef.current;

    // Connect EQ if any band is active
    const eqActive = audioEffects.eq.low !== 0 || audioEffects.eq.mid !== 0 || audioEffects.eq.high !== 0;
    if (eqActive && eqNodesRef.current.length >= 3) {
      // Connect EQ nodes in series
      eqNodesRef.current[0].connect(eqNodesRef.current[1]);
      eqNodesRef.current[1].connect(eqNodesRef.current[2]);
      currentNode.connect(eqNodesRef.current[0]);
      currentNode = eqNodesRef.current[2];
    }

    // Connect compressor if active (threshold < 0 means compression is active)
    if (compressorRef.current && audioEffects.compressor.threshold < 0) {
      currentNode.connect(compressorRef.current);
      currentNode = compressorRef.current;
    }

    // Connect stereo widener if active
    if (stereoWidenerRef.current && audioEffects.stereoWidener.width !== 0) {
      currentNode.connect(stereoWidenerRef.current);
      currentNode = stereoWidenerRef.current;
    }

    // Connect limiter if active (threshold < 0 means limiting is active)
    if (limiterRef.current && audioEffects.limiter.threshold < 0) {
      currentNode.connect(limiterRef.current);
      currentNode = limiterRef.current;
    }

    // Premium effects - only connect if they exist and are enabled
    if (gMasteringCompRef.current && audioEffects.gMasteringCompressor) {
      currentNode.connect(gMasteringCompRef.current);
      currentNode = gMasteringCompRef.current;
    }

    if (gPrecisionEQRefs.current.length > 0 && audioEffects.gPrecisionEQ) {
      // Connect G-Precision EQ bands in series
      for (let i = 0; i < gPrecisionEQRefs.current.length - 1; i++) {
        gPrecisionEQRefs.current[i].connect(gPrecisionEQRefs.current[i + 1]);
      }
      currentNode.connect(gPrecisionEQRefs.current[0]);
      currentNode = gPrecisionEQRefs.current[gPrecisionEQRefs.current.length - 1];
    }

    if (gDigitalTapeRef.current && audioEffects.gDigitalTape) {
      currentNode.connect(gDigitalTapeRef.current);
      currentNode = gDigitalTapeRef.current;
    }

    if (gLimiterRef.current && audioEffects.gLimiter) {
      currentNode.connect(gLimiterRef.current);
      currentNode = gLimiterRef.current;
    }

    if (gMultiBandRefs.current.length >= 3 && audioEffects.gMultiBand) {
      // Connect multi-band compressors in parallel (simplified)
      currentNode.connect(gMultiBandRefs.current[0]);
      currentNode = gMultiBandRefs.current[0];
    }

    // Connect to analyser and output
    currentNode.connect(analyserRef.current);
    analyserRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current!.destination);

  }, [audioEffects]);

  // Update effect parameters in real-time
  const updateEffectParameters = useCallback(() => {
    // Update EQ
    if (eqNodesRef.current.length >= 3) {
      eqNodesRef.current[0].gain.value = audioEffects.eq.low;
      eqNodesRef.current[1].gain.value = audioEffects.eq.mid;
      eqNodesRef.current[2].gain.value = audioEffects.eq.high;
    }

    // Update compressor
    if (compressorRef.current) {
      compressorRef.current.threshold.value = audioEffects.compressor.threshold;
      compressorRef.current.ratio.value = audioEffects.compressor.ratio;
      compressorRef.current.attack.value = audioEffects.compressor.attack / 1000;
      compressorRef.current.release.value = audioEffects.compressor.release / 1000;
    }

    // Update stereo widener (simplified mid-side processing)
    if (stereoWidenerRef.current) {
      const width = audioEffects.stereoWidener.width;
      // Apply subtle stereo enhancement
      stereoWidenerRef.current.gain.value = 1 + (width / 100) * 0.3;
    }

    // Update limiter
    if (limiterRef.current) {
      limiterRef.current.threshold.value = audioEffects.limiter.threshold;
      limiterRef.current.ratio.value = 20; // Hard limiting
    }

    // Update volume
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = audioEffects.loudness.volume * (isMuted ? 0 : volume);
    }

    // Update premium effects
    if (gMasteringCompRef.current && audioEffects.gMasteringCompressor) {
      const comp = audioEffects.gMasteringCompressor;
      gMasteringCompRef.current.threshold.value = comp.threshold;
      gMasteringCompRef.current.ratio.value = comp.ratio;
      gMasteringCompRef.current.attack.value = comp.attack / 1000;
      gMasteringCompRef.current.release.value = comp.release / 1000;
    }

    if (gPrecisionEQRefs.current.length > 0 && audioEffects.gPrecisionEQ) {
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

    if (gDigitalTapeRef.current && audioEffects.gDigitalTape) {
      // Update tape saturation curve
      const saturation = audioEffects.gDigitalTape.saturation;
      const curve = new Float32Array(44100);
      for (let i = 0; i < 44100; i++) {
        const x = (i * 2) / 44100 - 1;
        curve[i] = x + (saturation / 100) * Math.sin(x * Math.PI);
      }
      gDigitalTapeRef.current.curve = curve;
    }

    if (gLimiterRef.current && audioEffects.gLimiter) {
      const limiter = audioEffects.gLimiter;
      gLimiterRef.current.threshold.value = limiter.threshold;
      gLimiterRef.current.ratio.value = 20;
      gLimiterRef.current.release.value = limiter.release / 1000;
    }

    if (gMultiBandRefs.current.length >= 3 && audioEffects.gMultiBand) {
      const bands = audioEffects.gMultiBand;
      gMultiBandRefs.current[0].threshold.value = bands.low.threshold;
      gMultiBandRefs.current[0].ratio.value = bands.low.ratio;
      gMultiBandRefs.current[1].threshold.value = bands.mid.threshold;
      gMultiBandRefs.current[1].ratio.value = bands.mid.ratio;
      gMultiBandRefs.current[2].threshold.value = bands.high.threshold;
      gMultiBandRefs.current[2].ratio.value = bands.high.ratio;
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
    if (timeData.length >= 2) {
      const left = timeData.slice(0, timeData.length / 2);
      const right = timeData.slice(timeData.length / 2);
      let sumL = 0, sumR = 0, sumLR = 0;
      for (let i = 0; i < left.length; i++) {
        sumL += left[i] * left[i];
        sumR += right[i] * right[i];
        sumLR += left[i] * right[i];
      }
      correlation = sumLR / Math.sqrt(sumL * sumR);
    }

    // Update meter data
    onMeterUpdate({
      lufs: lufs,
      peak: peak,
      rms: rms / 128,
      correlation: correlation,
      leftLevel: rms / 128,
      rightLevel: rms / 128,
      frequencyData: Array.from(frequencyData),
      goniometerData: Array.from(timeData)
    });

  }, [onMeterUpdate]);

  // Effect update loop
  useEffect(() => {
    updateEffectParameters();
  }, [updateEffectParameters]);

  // Reconnect processing chain when effects change
  useEffect(() => {
    if (audioContextRef.current) {
      connectProcessingChain();
    }
  }, [connectProcessingChain]);

  // Analysis loop
  useEffect(() => {
    if (!isPlaying) return;

    const analysisInterval = setInterval(updateAnalysis, 50); // 20fps
    return () => clearInterval(analysisInterval);
  }, [isPlaying, updateAnalysis]);

  // Initialize when audio file changes
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      
      // Initialize audio context when user interacts
      const handleUserInteraction = () => {
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
        if (!audioContextRef.current) {
          initializeAudioContext();
        }
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
      
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
      
      return () => {
        URL.revokeObjectURL(url);
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
    }
  }, [audioFile, initializeAudioContext]);

  // Audio event handlers
  const handlePlay = () => {
    try {
      if (audioRef.current) {
        // Ensure audio context is resumed
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
            });
        }
      }
    } catch (error) {
      console.error('Error in handlePlay:', error);
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
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
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-4">
          <Settings className="w-12 h-12 mx-auto mb-2" />
          <p>Upload an audio file to start real-time mastering</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Real-Time Mastering Player</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* File Info */}
      <div className="mb-4 p-3 bg-gray-800 rounded">
        <p className="text-sm text-gray-300">
          <span className="font-medium">File:</span> {audioFile.name}
        </p>
        <p className="text-sm text-gray-400">
          <span className="font-medium">Size:</span> {(audioFile.size / 1024 / 1024).toFixed(2)} MB
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

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={skipBackward}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <SkipBack className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-3 rounded-full bg-crys-gold hover:bg-yellow-400 transition-colors shadow-lg"
            disabled={isProcessing}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black" />
            ) : (
              <Play className="w-5 h-5 text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={skipForward}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <SkipForward className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {isMuted ? (
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
};

export default RealTimeMasteringPlayer;
