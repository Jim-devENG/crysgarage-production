import React, { useEffect, useRef, useState } from 'react';

interface FrequencySpectrumProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  title?: string;
  targetLufs?: number;
  targetTruePeak?: number;
  analyserNode?: AnalyserNode | null;
}

const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  audioElement,
  isPlaying,
  title = "Frequency Spectrum",
  targetLufs,
  targetTruePeak,
  analyserNode = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lufsValue, setLufsValue] = useState<number>(0);
  const [peakValue, setPeakValue] = useState<number>(0);
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (analyserNode) {
      analyserRef.current = analyserNode;
    } else {
      analyserRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode]);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;

      animationRef.current = requestAnimationFrame(draw);
      setAnimationTime(prev => prev + 0.016); // ~60fps
      
      analyser.getByteFrequencyData(dataArray);

      // Calculate LUFS and Peak values
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        sum += value * value;
        if (value > peak) peak = value;
      }
      
      const rms = Math.sqrt(sum / bufferLength);
      const lufs = 20 * Math.log10(rms) - 70;
      
      setLufsValue(lufs);
      setPeakValue(20 * Math.log10(peak) - 70);

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create animated background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const time = animationTime * 0.5;
      bgGradient.addColorStop(0, `rgba(15, 23, 42, ${0.3 + 0.1 * Math.sin(time)})`);
      bgGradient.addColorStop(0.5, `rgba(30, 41, 59, ${0.2 + 0.1 * Math.sin(time + 1)})`);
      bgGradient.addColorStop(1, `rgba(15, 23, 42, ${0.3 + 0.1 * Math.sin(time + 2)})`);
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars with enhanced effects
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const rawHeight = (dataArray[i] / 255) * canvas.height;
        
        // Add smooth animation with easing
        const targetHeight = rawHeight;
        const currentHeight = barHeight || 0;
        barHeight = currentHeight + (targetHeight - currentHeight) * 0.3;

        if (barHeight < 2) continue; // Skip very small bars

        // Create animated gradient based on frequency and time
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        const frequency = i * (audioContextRef.current?.sampleRate || 44100) / (analyser.fftSize * 2);
        const intensity = Math.sin(time + i * 0.1) * 0.2 + 0.8;
        
        if (frequency < 60) {
          // Sub bass - deep purple with glow
          gradient.addColorStop(0, `rgba(147, 51, 234, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(168, 85, 247, ${intensity * 0.8})`);
          gradient.addColorStop(1, `rgba(196, 181, 253, ${intensity * 0.6})`);
        } else if (frequency < 250) {
          // Bass - blue with cyan
          gradient.addColorStop(0, `rgba(59, 130, 246, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(96, 165, 250, ${intensity * 0.8})`);
          gradient.addColorStop(1, `rgba(147, 197, 253, ${intensity * 0.6})`);
        } else if (frequency < 2000) {
          // Low mid - emerald green
          gradient.addColorStop(0, `rgba(16, 185, 129, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(52, 211, 153, ${intensity * 0.8})`);
          gradient.addColorStop(1, `rgba(110, 231, 183, ${intensity * 0.6})`);
        } else if (frequency < 4000) {
          // Mid - amber/yellow
          gradient.addColorStop(0, `rgba(245, 158, 11, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(251, 191, 36, ${intensity * 0.8})`);
          gradient.addColorStop(1, `rgba(253, 224, 71, ${intensity * 0.6})`);
        } else if (frequency < 8000) {
          // High mid - orange
          gradient.addColorStop(0, `rgba(249, 115, 22, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(251, 146, 60, ${intensity * 0.8})`);
          gradient.addColorStop(1, `rgba(253, 186, 116, ${intensity * 0.6})`);
        } else {
          // High - pink/red
          gradient.addColorStop(0, `rgba(236, 72, 153, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(244, 114, 182, ${intensity * 0.8})`);
          gradient.addColorStop(1, `rgba(251, 207, 232, ${intensity * 0.6})`);
        }

        // Draw main bar with glow effect
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Draw highlight on top
        const highlightGradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height - barHeight + 5);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.shadowBlur = 0;
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, 5);

        x += barWidth + 1;
      }

      // Draw animated target lines
      if (targetLufs !== undefined) {
        const targetY = canvas.height - ((targetLufs + 70) / 70) * canvas.height;
        const pulseIntensity = Math.sin(time * 3) * 0.3 + 0.7;
        
        ctx.strokeStyle = `rgba(251, 191, 36, ${pulseIntensity})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -time * 50; // Animated dash movement
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(canvas.width, targetY);
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
      }

      if (targetTruePeak !== undefined) {
        const targetY = canvas.height - ((targetTruePeak + 70) / 70) * canvas.height;
        const pulseIntensity = Math.sin(time * 4) * 0.3 + 0.7;
        
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulseIntensity})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 3]);
        ctx.lineDashOffset = time * 30;
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(canvas.width, targetY);
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
      }

      // Draw frequency labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      
      const frequencies = [60, 250, 1000, 4000, 8000, 16000];
      frequencies.forEach(freq => {
        const xPos = (freq / 16000) * canvas.width;
        if (xPos > 0 && xPos < canvas.width) {
          ctx.fillText(`${freq}Hz`, xPos, canvas.height - 5);
        }
      });
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, targetLufs, targetTruePeak, animationTime]);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-center text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {title}
      </h4>
      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full h-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-600/30 shadow-2xl transition-all duration-300 group-hover:border-slate-500/50 group-hover:shadow-blue-500/20"
        />
        {isAnalyzing && (
          <div className="absolute top-3 left-3 text-xs space-y-1 backdrop-blur-sm bg-black/20 rounded-lg p-2 border border-white/10">
            <div className="text-yellow-300 font-mono">
              LUFS: {lufsValue.toFixed(1)} dB
            </div>
            <div className="text-red-300 font-mono">
              Peak: {peakValue.toFixed(1)} dB
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 opacity-60">
          Live
        </div>
      </div>
    </div>
  );
};

export default FrequencySpectrum;
