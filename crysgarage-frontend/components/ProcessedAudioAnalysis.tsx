import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart3, Gauge, Zap, Music2, Volume2 } from 'lucide-react';

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
    rmsLevel: 0
  });

  // Initialize real-time analysis using existing audio element
  useEffect(() => {
    if (!audioElement || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const initRealTimeAnalysis = async () => {
      try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

        // Start analysis
        startRealTimeAnalysis();

      } catch (error) {
        console.error('Error initializing real-time analysis:', error);
      }
    };

    initRealTimeAnalysis();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioElement, isPlaying]);

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

      setRealTimeData({
        currentBass,
        currentMid,
        currentTreble,
        currentVolume: rms * 100,
        peakFrequency,
        rmsLevel: rms * 100
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

    if (!analysis) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className={`w-5 h-5 ${isProcessing ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
          <h4 className={`text-lg font-semibold ${isProcessing ? 'text-green-400' : 'text-gray-400'}`}>
            Real-Time Analysis
          </h4>
          {isProcessing && (
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-medium">
              {isProcessing
                ? 'Processing your audio... Analysis will appear here shortly'
                : 'Analysis will appear here after processing your audio'
              }
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {isProcessing
              ? 'Please wait while we analyze and process your audio file'
              : 'Upload an audio file and select a genre to see real-time analysis'
            }
          </div>
          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-700 rounded text-xs text-gray-400">
            <div>Debug: Analysis is null</div>
            <div>Is Processing: {isProcessing ? 'Yes' : 'No'}</div>
            <div>Genre: {genreName || 'None'}</div>
            <div>Audio URL: {audioUrl ? 'Present' : 'None'}</div>
            <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
            <div>Audio Element: {audioElement ? 'Present' : 'None'}</div>
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
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-green-400 animate-pulse" />
        <h4 className="text-lg font-semibold text-green-400">Real-Time Analysis</h4>
        {isPlaying && (
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Real-time Frequency Spectrum */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">Live Frequency Spectrum</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-2">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full h-30 rounded"
          />
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Bass Level */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Bass</span>
          </div>
          <div className={`text-lg font-bold ${getQualityColor(realTimeData.currentBass)}`}>
            {realTimeData.currentBass.toFixed(0)}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full transition-all duration-100 ${getQualityBarColor(realTimeData.currentBass)}`}
              style={{ width: `${Math.min(realTimeData.currentBass / 2, 100)}%` }}
            />
          </div>
        </div>

        {/* Mid Level */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Mid</span>
          </div>
          <div className={`text-lg font-bold ${getQualityColor(realTimeData.currentMid)}`}>
            {realTimeData.currentMid.toFixed(0)}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full transition-all duration-100 ${getQualityBarColor(realTimeData.currentMid)}`}
              style={{ width: `${Math.min(realTimeData.currentMid / 2, 100)}%` }}
            />
          </div>
        </div>

        {/* Treble Level */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Treble</span>
          </div>
          <div className={`text-lg font-bold ${getQualityColor(realTimeData.currentTreble)}`}>
            {realTimeData.currentTreble.toFixed(0)}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full transition-all duration-100 ${getQualityBarColor(realTimeData.currentTreble)}`}
              style={{ width: `${Math.min(realTimeData.currentTreble / 2, 100)}%` }}
            />
          </div>
        </div>

        {/* Volume Level */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Gauge className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Volume</span>
          </div>
          <div className={`text-lg font-bold ${getQualityColor(realTimeData.currentVolume, 50)}`}>
            {realTimeData.currentVolume.toFixed(1)}dB
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full transition-all duration-100 ${getQualityBarColor(realTimeData.currentVolume, 50)}`}
              style={{ width: `${Math.min(realTimeData.currentVolume * 2, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Analysis */}
        <div className="space-y-3">
          <h5 className="text-md font-semibold text-blue-400 flex items-center space-x-2">
            <Music2 className="w-4 h-4" />
            <span>Frequency Analysis</span>
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Peak Frequency:</span>
              <span className="text-white font-mono">
                {realTimeData.peakFrequency > 0 ? `${realTimeData.peakFrequency.toFixed(0)} Hz` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dominant Freq:</span>
              <span className="text-white font-mono">
                {analysis.dominantFrequencies[0]?.toFixed(0) || 'N/A'} Hz
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dynamic Range:</span>
              <span className="text-white">{analysis.dynamicRange.toFixed(1)} dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rhythm Complexity:</span>
              <span className="text-white">{analysis.rhythmComplexity.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Content Analysis */}
        <div className="space-y-3">
          <h5 className="text-md font-semibold text-green-400">Content Analysis</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Bass Content:</span>
              <span className="text-white">{analysis.bassContent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mid Content:</span>
              <span className="text-white">{analysis.midContent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Treble Content:</span>
              <span className="text-white">{analysis.trebleContent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Vocal Presence:</span>
              <span className="text-white">{analysis.vocalPresence.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Genre:</span>
              <span className="text-white">{genreName || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Settings */}
      {genreName && analysis.appliedSettings && (
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h5 className="text-md font-semibold mb-3 text-indigo-400">Applied Processing Settings</h5>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Gain</div>
              <div className="text-white font-mono">{analysis.appliedSettings.gain.toFixed(1)}x</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Bass Boost</div>
              <div className="text-white font-mono">{analysis.appliedSettings.bassBoost.toFixed(1)}dB</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Mid Cut</div>
              <div className="text-white font-mono">{analysis.appliedSettings.midCut.toFixed(1)}dB</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Presence</div>
              <div className="text-white font-mono">{analysis.appliedSettings.presenceBoost.toFixed(1)}dB</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Clarity</div>
              <div className="text-white font-mono">{analysis.appliedSettings.clarityBoost.toFixed(1)}dB</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Air</div>
              <div className="text-white font-mono">{analysis.appliedSettings.airBoost.toFixed(1)}dB</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Comp Threshold</div>
              <div className="text-white font-mono">{analysis.appliedSettings.compressionThreshold.toFixed(1)}dB</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Comp Ratio</div>
              <div className="text-white font-mono">{analysis.appliedSettings.compressionRatio.toFixed(1)}:1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessedAudioAnalysis;
