import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart3, Gauge, Zap, Music2, Volume2, Smartphone } from 'lucide-react';

interface ProcessedAudioAnalysisProps {
  analysis: {
    dominantFrequencies: number[];
    dynamicRange: number;
    bassContent: number;
    midContent: number;
    trebleContent: number;
    rhythmComplexity: number;
    vocalPresence: number;
    appliedSettings: {
      gain: number;
      bassBoost: number;
      midCut: number;
      presenceBoost: number;
      clarityBoost: number;
      airBoost: number;
      compressionThreshold: number;
      compressionRatio: number;
    };
  } | null;
  genreName: string | undefined;
  audioUrl?: string;
  isPlaying?: boolean;
  isProcessing?: boolean;
  audioElement?: HTMLAudioElement | null;
}

const ProcessedAudioAnalysis: React.FC<ProcessedAudioAnalysisProps> = ({ 
  analysis, 
  genreName, 
  audioUrl, 
  isPlaying = false,
  isProcessing = false,
  audioElement = null
}) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationRef = useRef<number>();
  const [realTimeData, setRealTimeData] = useState({
    currentBass: 0,
    currentMid: 0,
    currentTreble: 0,
    currentVolume: 0,
    peakFrequency: 0,
    rmsLevel: 0,
    lufs: -70,
    peak: -70
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileAudioSupported, setMobileAudioSupported] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detect mobile device and audio support
  useEffect(() => {
    const checkMobileSupport = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      // Check if Web Audio API is supported
      const audioSupported = !!(window.AudioContext || (window as any).webkitAudioContext);
      setMobileAudioSupported(audioSupported);
      
      console.log('Mobile detection:', { mobile, audioSupported });
    };
    
    checkMobileSupport();
  }, []);

  // Handle user interaction for mobile audio context
  const handleUserInteraction = async () => {
    if (!userInteracted && audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        setUserInteracted(true);
        console.log('Audio context resumed after user interaction');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  };

  // Initialize real-time analysis using existing audio element
  useEffect(() => {
    if (!audioElement || !mobileAudioSupported) {
      return;
    }

    const initRealTimeAnalysis = async () => {
      try {
        // Only create audio context if it doesn't exist
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;

          // Create analyser
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;

          // Create media element source from existing audio element
          const source = audioContext.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          sourceRef.current = source as any;

          console.log('Audio context initialized:', audioContext.state);
        }

        // For mobile, we need user interaction to resume audio context
        if (isMobile && audioContextRef.current.state === 'suspended') {
          console.log('Mobile device detected - waiting for user interaction');
          return;
        }

        // Resume audio context if it's suspended (desktop)
        if (!isMobile && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        // Start analysis if playing and context is running
        if (isPlaying && audioContextRef.current.state === 'running') {
          startRealTimeAnalysis();
        }

      } catch (error) {
        console.error('Error initializing real-time analysis:', error);
        setMobileAudioSupported(false);
      }
    };

    initRealTimeAnalysis();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, mobileAudioSupported, isMobile]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioContextRef.current || !analyserRef.current || !mobileAudioSupported) {
      return;
    }

    if (isPlaying) {
      // For mobile, ensure user has interacted
      if (isMobile && !userInteracted) {
        console.log('Mobile: Waiting for user interaction before starting analysis');
        return;
      }

      // Resume audio context and start analysis
      audioContextRef.current.resume().then(() => {
        if (audioContextRef.current?.state === 'running') {
          startRealTimeAnalysis();
        }
      }).catch(error => {
        console.error('Failed to resume audio context:', error);
      });
    } else {
      // Stop analysis but don't close the context
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isPlaying, mobileAudioSupported, isMobile, userInteracted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRealTimeAnalysis = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Get frequency and time data
      analyser.getByteFrequencyData(dataArray);
      analyser.getByteTimeDomainData(timeDataArray);

      // Calculate real-time metrics
      const bassSum = dataArray.slice(0, Math.floor(bufferLength * 0.1)).reduce((a, b) => a + b, 0);
      const midSum = dataArray.slice(Math.floor(bufferLength * 0.1), Math.floor(bufferLength * 0.5)).reduce((a, b) => a + b, 0);
      const trebleSum = dataArray.slice(Math.floor(bufferLength * 0.5)).reduce((a, b) => a + b, 0);

      const currentBass = bassSum / (bufferLength * 0.1);
      const currentMid = midSum / (bufferLength * 0.4);
      const currentTreble = trebleSum / (bufferLength * 0.5);

      // Calculate RMS level
      let rms = 0;
      for (let i = 0; i < timeDataArray.length; i++) {
        const sample = (timeDataArray[i] - 128) / 128;
        rms += sample * sample;
      }
      rms = Math.sqrt(rms / timeDataArray.length);

      // Find peak frequency
      let maxIndex = 0;
      let maxValue = 0;
      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      const peakFrequency = maxIndex * audioContextRef.current!.sampleRate / (2 * bufferLength);

      // Calculate LUFS (simplified K-weighting)
      const kWeightedSum = dataArray.slice(0, Math.floor(bufferLength * 0.1)).reduce((a, b) => a + b, 0) * 1.4 + // Bass boost
                          dataArray.slice(Math.floor(bufferLength * 0.1), Math.floor(bufferLength * 0.5)).reduce((a, b) => a + b, 0) + // Mid
                          dataArray.slice(Math.floor(bufferLength * 0.5)).reduce((a, b) => a + b, 0) * 1.2; // Treble boost
      
      const kWeightedAverage = kWeightedSum / bufferLength;
      const lufs = 20 * Math.log10(kWeightedAverage / 255) - 70; // Convert to LUFS scale
      
      // Calculate Peak
      let peak = -70;
      for (let i = 0; i < timeDataArray.length; i++) {
        const sample = Math.abs((timeDataArray[i] - 128) / 128);
        const sampleDb = 20 * Math.log10(sample);
        if (sampleDb > peak) {
          peak = sampleDb;
        }
      }

      setRealTimeData({
        currentBass,
        currentMid,
        currentTreble,
        currentVolume: rms * 100,
        peakFrequency,
        rmsLevel: rms * 100,
        lufs: Math.max(-70, lufs),
        peak: Math.max(-70, peak)
      });

      // Draw frequency spectrum
      drawFrequencySpectrum(ctx, dataArray, bufferLength);
    };

    draw();
  };

  const drawFrequencySpectrum = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, bufferLength: number) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / bufferLength;
    const barSpacing = 1;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      const x = i * (barWidth + barSpacing);
      const y = height - barHeight;

      // Create bar gradient
      const barGradient = ctx.createLinearGradient(0, y, 0, height);
      barGradient.addColorStop(0, '#22c55e');
      barGradient.addColorStop(0.5, '#16a34a');
      barGradient.addColorStop(1, '#15803d');

      ctx.fillStyle = barGradient;
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Draw frequency labels
    ctx.fillStyle = '#22c55e';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    const frequencies = [60, 250, 1000, 4000, 16000];
    frequencies.forEach(freq => {
      const index = Math.floor(freq * bufferLength / (audioContextRef.current?.sampleRate || 44100) * 2);
      const x = index * (barWidth + barSpacing);
      if (x < width) {
        ctx.fillText(freq < 1000 ? `${freq}Hz` : `${freq/1000}k`, x, height - 5);
      }
    });
  };

    // Mobile audio context interaction prompt
  if (isMobile && !userInteracted && audioContextRef.current?.state === 'suspended') {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Smartphone className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-semibold text-yellow-400">Mobile Audio Setup</h4>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-400 mb-3">
            <p className="text-sm font-medium mb-2">
              Tap to enable audio analysis
            </p>
            <p className="text-xs text-gray-500">
              Mobile browsers require user interaction to start audio processing
            </p>
          </div>
          <button
            onClick={handleUserInteraction}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Enable Audio Analysis
          </button>
        </div>
      </div>
    );
  }

  // Audio not supported on this device
  if (!mobileAudioSupported) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Smartphone className="w-4 h-4 text-red-400" />
          <h4 className="text-sm font-semibold text-red-400">Audio Not Supported</h4>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-400 mb-3">
            <p className="text-sm font-medium mb-2">
              Web Audio API not supported
            </p>
            <p className="text-xs text-gray-500">
              Your browser doesn't support real-time audio analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className={`w-4 h-4 ${isProcessing ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
          <h4 className={`text-sm font-semibold ${isProcessing ? 'text-green-400' : 'text-gray-400'}`}>
            Real-Time Analysis
          </h4>
          {isProcessing && (
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
        </div>
        <div className="text-center py-4">
          <div className="text-gray-500 mb-3">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">
              {isProcessing
                ? 'Processing your audio... Analysis will appear here shortly'
                : 'Analysis will appear here after processing your audio'
              }
            </p>
          </div>
          <div className="text-xs text-gray-600">
            {isProcessing
              ? 'Please wait while we analyze and process your audio file'
              : 'Upload an audio file and select a genre to see real-time analysis'
            }
          </div>
          {/* Debug info */}
          <div className="mt-3 p-2 bg-gray-700 rounded text-xs text-gray-400">
            <div>Debug: Analysis is null</div>
            <div>Is Processing: {isProcessing ? 'Yes' : 'No'}</div>
            <div>Genre: {genreName || 'None'}</div>
            <div>Audio URL: {audioUrl ? 'Present' : 'None'}</div>
            <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
            <div>Audio Element: {audioElement ? 'Present' : 'None'}</div>
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>Audio Supported: {mobileAudioSupported ? 'Yes' : 'No'}</div>
            <div>User Interacted: {userInteracted ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    );
  }

  const getQualityColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage < 30) return 'text-red-400';
    if (percentage < 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getQualityBarColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="w-4 h-4 text-green-400 animate-pulse" />
        <h4 className="text-sm font-semibold text-green-400">Real-Time Analysis</h4>
        {isPlaying && (
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      {/* Compact Real-time Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Bass</div>
          <div className={`text-sm font-bold ${getQualityColor(realTimeData.currentBass)}`}>
            {realTimeData.currentBass.toFixed(0)}
          </div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Mid</div>
          <div className={`text-sm font-bold ${getQualityColor(realTimeData.currentMid)}`}>
            {realTimeData.currentMid.toFixed(0)}
          </div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Treble</div>
          <div className={`text-sm font-bold ${getQualityColor(realTimeData.currentTreble)}`}>
            {realTimeData.currentTreble.toFixed(0)}
          </div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Vol</div>
          <div className={`text-sm font-bold ${getQualityColor(realTimeData.currentVolume, 50)}`}>
            {realTimeData.currentVolume.toFixed(1)}dB
          </div>
        </div>
      </div>

      {/* LUFS and Peak Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-xs text-gray-400">LUFS</div>
          <div className={`text-sm font-bold ${realTimeData.lufs > -14 ? 'text-red-400' : realTimeData.lufs > -16 ? 'text-yellow-400' : 'text-green-400'}`}>
            {realTimeData.lufs.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Peak</div>
          <div className={`text-sm font-bold ${realTimeData.peak > -1 ? 'text-red-400' : realTimeData.peak > -3 ? 'text-yellow-400' : 'text-green-400'}`}>
            {realTimeData.peak.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Mini Frequency Spectrum */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">Frequency Spectrum</div>
        <div className="bg-gray-900 rounded p-1">
          <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className="w-full h-15 rounded"
          />
        </div>
      </div>

      {/* Compact Analysis Results */}
      {analysis && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Dynamic Range</div>
              <div className="font-bold text-blue-400">{analysis.dynamicRange.toFixed(1)} dB</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Rhythm</div>
              <div className="font-bold text-green-400">{analysis.rhythmComplexity.toFixed(0)}%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Target LUFS</div>
              <div className="font-bold text-purple-400">-14.0</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Target Peak</div>
              <div className="font-bold text-orange-400">-1.0</div>
            </div>
          </div>
          <div className="bg-gray-700 rounded p-2 text-xs">
            <div className="text-gray-400 mb-1">Applied: Gain +{analysis.appliedSettings.gain}dB | Bass +{analysis.appliedSettings.bassBoost}dB</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessedAudioAnalysis;
