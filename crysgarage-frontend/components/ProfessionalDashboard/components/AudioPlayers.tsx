import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import FrequencySpectrum from '../../FrequencySpectrum';
import { GenrePreset } from '../types';

interface AudioPlayersProps {
  selectedFile: File | null;
  selectedGenre: any;
  genrePresets: Record<string, GenrePreset>;
  onAudioReady: () => void;
  onProcessingComplete: (audioUrl: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const AudioPlayers: React.FC<AudioPlayersProps> = ({
  selectedFile,
  selectedGenre,
  genrePresets,
  onAudioReady,
  onProcessingComplete,
  isProcessing,
  setIsProcessing
}) => {
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [compressorNode, setCompressorNode] = useState<DynamicsCompressorNode | null>(null);
  const [limiterNode, setLimiterNode] = useState<DynamicsCompressorNode | null>(null);
  const [eqLowNode, setEqLowNode] = useState<BiquadFilterNode | null>(null);
  const [eqMidNode, setEqMidNode] = useState<BiquadFilterNode | null>(null);
  const [eqHighNode, setEqHighNode] = useState<BiquadFilterNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isProcessingReady, setIsProcessingReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  // Initialize audio processing when component mounts
  useEffect(() => {
    try {
      initializeAudioProcessing();
    } catch (err) {
      console.error('Error initializing audio processing:', err);
      setError('Failed to initialize audio processing');
    }
  }, []);

  // Apply genre preset when genre changes - this is the key for real-time changes
  useEffect(() => {
    if (selectedGenre && isProcessingReady && gainNode && compressorNode) {
      console.log('🎵 Genre changed to:', selectedGenre.name);
      console.log('🔧 Audio context state:', audioContext?.state);
      console.log('🎚️ Processing nodes ready:', !!gainNode, !!compressorNode);
      
      // Ensure audio context is resumed
      if (audioContext && audioContext.state === 'suspended') {
        console.log('⏸️ Audio context suspended, resuming...');
        audioContext.resume().then(() => {
          console.log('✅ Audio context resumed, applying preset');
          applyGenrePreset(selectedGenre);
        });
      } else {
        console.log('✅ Audio context ready, applying preset immediately');
        applyGenrePreset(selectedGenre);
      }
    } else {
      console.log('❌ Cannot apply preset:', {
        hasGenre: !!selectedGenre,
        isReady: isProcessingReady,
        hasGain: !!gainNode,
        hasCompressor: !!compressorNode
      });
    }
  }, [selectedGenre, isProcessingReady, gainNode, compressorNode, audioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContext) {
        try {
          audioContext.close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
      }
    };
  }, [audioContext]);

  const initializeAudioProcessing = async () => {
    try {
      console.log('🎵 Initializing audio processing...');
      
      // Create audio context
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🔧 Audio context created, state:', ctx.state);
      
      // Resume audio context if suspended
      if (ctx.state === 'suspended') {
        console.log('⏸️ Audio context suspended, resuming...');
        await ctx.resume();
        console.log('✅ Audio context resumed, state:', ctx.state);
      }
      
      // Create processing nodes
      const gain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      const limiter = ctx.createDynamicsCompressor();
      const eqLow = ctx.createBiquadFilter();
      const eqMid = ctx.createBiquadFilter();
      const eqHigh = ctx.createBiquadFilter();
      const analyser = ctx.createAnalyser();
      
      // Configure analyzer
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      // Configure EQ
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 200;
      
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;
      eqMid.Q.value = 1;
      
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 5000;
      
      // Configure limiter for true-peak control
      limiter.ratio.value = 20;
      limiter.attack.value = 0.001;
      
      // Connect processing chain: source -> EQ(L/M/H) -> compressor -> limiter -> gain -> analyser -> destination
      eqLow.connect(eqMid).connect(eqHigh).connect(compressor).connect(limiter).connect(gain).connect(analyser).connect(ctx.destination);
      console.log('🔗 Processing chain connected');
      
      // Set initial values
      gain.gain.value = 1.0;
      compressor.threshold.value = -24;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressor.knee.value = 10;
      
      setAudioContext(ctx);
      setGainNode(gain);
      setCompressorNode(compressor);
      setLimiterNode(limiter);
      setEqLowNode(eqLow);
      setEqMidNode(eqMid);
      setEqHighNode(eqHigh);
      setAnalyserNode(analyser);
      setIsProcessingReady(true);
      
      console.log('✅ Audio processing initialized successfully');
      console.log('🎚️ Initial values - Gain:', gain.gain.value, 'Threshold:', compressor.threshold.value, 'Ratio:', compressor.ratio.value);
      onAudioReady();
      
    } catch (error) {
      console.error('❌ Error initializing audio processing:', error);
      setError('Failed to initialize audio processing');
    }
  };

  const applyGenrePreset = (genre: any) => {
    if (!gainNode || !compressorNode || !genre) {
      console.log('Cannot apply genre preset - missing nodes or genre');
      return;
    }
    
    try {
      setIsApplyingPreset(true);
      const preset = genrePresets[genre.id] || genrePresets.afrobeats;
      console.log('Applying preset for', genre.name, ':', preset);
      
      const currentTime = gainNode.context.currentTime;
      const transitionTime = 0.05; // Faster transition for more noticeable changes
      
      // Apply gain with smooth transition
      gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
      gainNode.gain.linearRampToValueAtTime(preset.gain, currentTime + transitionTime);
      
      // Apply compression with smooth transitions
      compressorNode.threshold.setValueAtTime(compressorNode.threshold.value, currentTime);
      compressorNode.threshold.linearRampToValueAtTime(preset.compression.threshold, currentTime + transitionTime);
      
      compressorNode.ratio.setValueAtTime(compressorNode.ratio.value, currentTime);
      compressorNode.ratio.linearRampToValueAtTime(preset.compression.ratio, currentTime + transitionTime);
      
      compressorNode.attack.setValueAtTime(compressorNode.attack.value, currentTime);
      compressorNode.attack.linearRampToValueAtTime(preset.compression.attack, currentTime + transitionTime);
      
      compressorNode.release.setValueAtTime(compressorNode.release.value, currentTime);
      compressorNode.release.linearRampToValueAtTime(preset.compression.release, currentTime + transitionTime);
      
      compressorNode.knee.setValueAtTime(10, currentTime);
      
      // Apply EQ in dB using multipliers from presets
      const toDb = (mult: number) => 20 * Math.log10(mult);
      if (eqLowNode && eqMidNode && eqHighNode) {
        eqLowNode.gain.setValueAtTime(eqLowNode.gain.value, currentTime);
        eqLowNode.gain.linearRampToValueAtTime(toDb(preset.eq.low), currentTime + transitionTime);
        
        eqMidNode.gain.setValueAtTime(eqMidNode.gain.value, currentTime);
        eqMidNode.gain.linearRampToValueAtTime(toDb(preset.eq.mid), currentTime + transitionTime);
        
        eqHighNode.gain.setValueAtTime(eqHighNode.gain.value, currentTime);
        eqHighNode.gain.linearRampToValueAtTime(toDb(preset.eq.high), currentTime + transitionTime);
      }
      
      // Apply limiter target threshold around preset truePeak
      if (limiterNode) {
        // truePeak is dBTP target; set limiter threshold slightly below to catch peaks
        const targetThreshold = Math.min(-0.1, preset.truePeak);
        limiterNode.threshold.setValueAtTime(limiterNode.threshold.value, currentTime);
        limiterNode.threshold.linearRampToValueAtTime(targetThreshold, currentTime + transitionTime);
      }
      
      console.log(`Applied ${genre.name} preset in real-time - Gain: ${preset.gain}, Threshold: ${preset.compression.threshold}, Ratio: ${preset.compression.ratio}`);
      
      // Hide indicator after transition
      setTimeout(() => {
        setIsApplyingPreset(false);
      }, transitionTime * 1000 + 100);
      
    } catch (error) {
      console.error('Error applying genre preset:', error);
      setIsApplyingPreset(false);
    }
  };

  const handleMasteredPlay = async () => {
    if (!isProcessingReady || !selectedFile) {
      console.log('❌ Cannot play mastered audio - not ready or no file');
      return;
    }

    try {
      console.log('🎵 Starting mastered audio playback...');
      
      // Create a new audio element
      const audio = new Audio();
      audio.src = URL.createObjectURL(selectedFile);
      
      // Wait for audio to be loaded
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });

      console.log('✅ Audio loaded successfully');

      // Always create a new audio source for the new audio element
      // This ensures the processing chain is properly connected
      if (audioSource) {
        console.log('🔌 Disconnecting old audio source');
        audioSource.disconnect();
      }
      
      console.log('🔌 Creating new audio source and connecting to processing chain');
      const source = audioContext!.createMediaElementSource(audio);
      // Connect new source to the start of the chain (EQ low)
      if (eqLowNode) {
        source.connect(eqLowNode);
      } else if (compressorNode) {
        // Fallback in case EQ isn't ready
        source.connect(compressorNode);
      }
      setAudioSource(source);
      console.log('✅ Audio source connected to processing chain');

      setOriginalAudioElement(audio);

      // Apply current genre preset immediately
      if (selectedGenre) {
        console.log('🎛️ Applying genre preset before playback');
        applyGenrePreset(selectedGenre);
      }

      setIsPlayingMastered(true);
      
      // Play the audio
      await audio.play();
      console.log('✅ Playing mastered audio with real-time processing');
      
    } catch (error) {
      console.error('❌ Error playing mastered audio:', error);
      setIsPlayingMastered(false);
      setError('Failed to play mastered audio');
    }
  };

  const handleMasteredPause = () => {
    try {
      if (originalAudioElement) {
        originalAudioElement.pause();
      }
      setIsPlayingMastered(false);
    } catch (error) {
      console.error('Error pausing mastered audio:', error);
    }
  };

  if (error) {
    return (
      <div className="bg-gray-700 rounded-xl p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">⚠️</span>
          </div>
          <p className="text-sm text-red-400 mb-2">Audio Error</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initializeAudioProcessing();
            }}
            className="mt-3 px-4 py-2 bg-crys-gold text-black rounded-lg text-sm hover:bg-yellow-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-xl p-6">
      <div className="space-y-4">
        {isProcessingReady ? (
          <>
            {/* Mastered audio controls */}
            <div className="bg-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={isPlayingMastered ? handleMasteredPause : handleMasteredPlay}
                  disabled={!selectedGenre}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isPlayingMastered
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-crys-gold hover:bg-yellow-400 text-black'
                  } disabled:bg-gray-500 disabled:cursor-not-allowed`}
                >
                  {isPlayingMastered ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                
                {isPlayingMastered && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400 font-medium">Live Processing</span>
                  </div>
                )}
                
                {isApplyingPreset && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-crys-gold rounded-full animate-pulse"></div>
                    <span className="text-sm text-crys-gold font-medium">Applying Preset...</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400">
                  {isApplyingPreset 
                    ? `Applying ${selectedGenre?.name} preset...`
                    : selectedGenre 
                      ? `${selectedGenre.name} preset applied in real-time`
                      : 'Select a genre to enable mastering'
                  }
                </p>
                
                {/* Show current processing values */}
                {selectedGenre && gainNode && compressorNode && (
                  <div className="mt-2 text-xs text-crys-gold">
                    <div className="flex justify-center space-x-4">
                      <span>Gain: {gainNode.gain.value.toFixed(1)}</span>
                      <span>Threshold: {compressorNode.threshold.value.toFixed(1)}dB</span>
                      <span>Ratio: {compressorNode.ratio.value.toFixed(1)}:1</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <FrequencySpectrum
              audioElement={originalAudioElement}
              isPlaying={isPlayingMastered}
              title={`${selectedGenre?.name || 'Mastered'} Frequency Spectrum`}
              targetLufs={selectedGenre ? genrePresets[selectedGenre.id]?.targetLufs : undefined}
              targetTruePeak={selectedGenre ? genrePresets[selectedGenre.id]?.truePeak : undefined}
              analyserNode={analyserNode}
            />
          </>
        ) : (
          <div className="bg-gray-600 rounded-lg p-6 text-center">
            <div className="w-6 h-6 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Initializing audio processing...</p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-xs text-crys-gold">
            {selectedGenre ? `Real-time ${selectedGenre.name} mastering` : 'Real-time audio processing'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayers;
