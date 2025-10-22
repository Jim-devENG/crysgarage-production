import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Zap, Cpu, Music, CheckCircle, Clock, Activity } from 'lucide-react';

interface RealTimeProcessingVisualizerProps {
  isProcessing: boolean;
  progress: number;
  stage: string;
  timeRemaining: string;
  audioEffects: any;
  chunkCount?: number;
  totalSize?: number;
}

const RealTimeProcessingVisualizer: React.FC<RealTimeProcessingVisualizerProps> = ({
  isProcessing,
  progress,
  stage,
  timeRemaining,
  audioEffects,
  chunkCount = 0,
  totalSize = 0
}) => {
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track active effects
  useEffect(() => {
    const effects = [];
    if (audioEffects?.eq?.enabled) effects.push('EQ');
    if (audioEffects?.compressor?.enabled) effects.push('Compressor');
    if (audioEffects?.loudness?.enabled) effects.push('Loudness');
    if (audioEffects?.limiter?.enabled) effects.push('Limiter');
    if (audioEffects?.stereoWidener?.enabled) effects.push('Stereo Widener');
    if (audioEffects?.gTuner?.enabled) effects.push('G-Tuner');
    if (audioEffects?.gDigitalTape?.enabled) effects.push('G-Digital Tape');
    if (audioEffects?.gMultiBand?.enabled) effects.push('G-Multi-Band');
    if (audioEffects?.gMasteringCompressor?.enabled) effects.push('G-Mastering Compressor');
    if (audioEffects?.gPrecisionEQ?.enabled) effects.push('G-Precision EQ');
    if (audioEffects?.gLimiter?.enabled) effects.push('G-Limiter');

    setActiveEffects(effects);
  }, [audioEffects]);

  // Generate waveform data when processing starts
  useEffect(() => {
    if (isProcessing && waveformData.length === 0) {
      // Generate realistic waveform data
      const bars = 100;
      const data = [];
      for (let i = 0; i < bars; i++) {
        // Create a realistic waveform pattern
        const baseHeight = 0.3 + Math.random() * 0.4;
        const variation = Math.sin(i * 0.1) * 0.2 + Math.random() * 0.3;
        data.push(Math.max(0.1, Math.min(1, baseHeight + variation)));
      }
      setWaveformData(data);
    }
  }, [isProcessing, waveformData.length]);

  // Draw waveform on canvas
  useEffect(() => {
    if (canvasRef.current && waveformData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set up drawing
      const barWidth = canvas.width / waveformData.length;
      const centerY = canvas.height / 2;

      // Draw waveform bars
      waveformData.forEach((height, index) => {
        const barHeight = height * (canvas.height * 0.8);
        const x = index * barWidth;
        const y = centerY - barHeight / 2;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#fbbf24'); // Gold top
        gradient.addColorStop(0.5, '#f59e0b'); // Gold middle
        gradient.addColorStop(1, '#d97706'); // Gold bottom

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
    }
  }, [waveformData]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 max-w-lg w-full mx-4 border border-gray-700 shadow-2xl">
                 {/* Header */}
         <div className="text-center mb-3">
           <div className="flex items-center justify-center space-x-2 mb-2">
             <div className="w-8 h-8 bg-gradient-to-r from-crys-gold to-yellow-400 rounded-full flex items-center justify-center">
               <BarChart3 className="w-4 h-4 text-black" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-white">Audio Processing</h2>
               <p className="text-xs text-gray-400">Recording mastered audio...</p>
             </div>
           </div>
         </div>

         {/* Player-Style Progress */}
         <div className="mb-3">
           <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                           {/* Player Controls */}
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-crys-gold rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                  <span className="text-white text-sm font-medium">Recording...</span>
                </div>
              </div>
             
                           {/* Waveform Player */}
              <div className="relative w-full bg-gray-800 rounded-lg h-16 overflow-hidden mb-2 border border-gray-600">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  width={400}
                  height={64}
                />
                {/* Moving Playhead */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-crys-gold shadow-lg z-10 transition-all duration-300 ease-out"
                  style={{ left: `${progress}%` }}
                >
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-crys-gold rounded-full border-2 border-white shadow-lg"></div>
                </div>
              </div>
             
                           {/* Player Info */}
              <div className="flex items-center justify-center text-xs text-gray-400">
                <span>{timeRemaining}</span>
              </div>
           </div>
         </div>

                 {/* Status Info */}
         <div className="grid grid-cols-2 gap-3 mb-3">
           {/* Current Stage */}
           <div className="bg-gray-800 rounded-lg p-2 border border-gray-600">
             <div className="flex items-center space-x-1 mb-1">
               <Clock className="w-3 h-3 text-blue-400" />
               <span className="text-white text-xs font-medium">Stage</span>
             </div>
             <div className="text-crys-gold text-xs font-semibold">{stage}</div>
           </div>

           {/* Active Effects Count */}
           <div className="bg-gray-800 rounded-lg p-2 border border-gray-600">
             <div className="flex items-center space-x-1 mb-1">
               <Zap className="w-3 h-3 text-green-400" />
               <span className="text-white text-xs font-medium">Effects</span>
             </div>
             <div className="text-green-400 text-xs font-semibold">{activeEffects.length} Active</div>
           </div>
         </div>

         {/* Compact Tips */}
         <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-2 border border-blue-600">
           <div className="flex items-start space-x-2">
             <Cpu className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
             <div>
               <h4 className="text-white text-xs font-medium mb-1">Processing Audio</h4>
               <p className="text-xs text-blue-200">Recording mastered audio with all effects applied...</p>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default RealTimeProcessingVisualizer;
