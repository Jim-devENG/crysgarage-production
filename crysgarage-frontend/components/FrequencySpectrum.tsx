import React, { useEffect, useRef, useState } from 'react';

interface FrequencySpectrumProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  title?: string;
  targetLufs?: number;
  targetTruePeak?: number;
  analyserNode?: AnalyserNode | null; // Add shared analyser node prop
}

const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  audioElement,
  isPlaying,
  title = "Frequency Spectrum",
  targetLufs,
  targetTruePeak,
  analyserNode = null // Use shared analyser if provided
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lufsValue, setLufsValue] = useState<number>(0);
  const [peakValue, setPeakValue] = useState<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Use only the provided shared analyserNode to avoid MediaElementSource conflicts
    if (analyserNode) {
      analyserRef.current = analyserNode;
    } else {
      analyserRef.current = null;
    }

    // Cleanup animation on dependency change
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
      
      analyser.getByteFrequencyData(dataArray);

      // Calculate LUFS and Peak values
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        sum += value * value;
        if (value > peak) peak = value;
      }
      
      // Calculate RMS (Root Mean Square) for LUFS approximation
      const rms = Math.sqrt(sum / bufferLength);
      const lufs = 20 * Math.log10(rms) - 70; // Approximate LUFS calculation
      
      setLufsValue(lufs);
      setPeakValue(20 * Math.log10(peak) - 70);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Create gradient based on frequency
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        
        // Color mapping based on frequency ranges
        const frequency = i * (audioContextRef.current?.sampleRate || 44100) / (analyser.fftSize * 2);
        
        if (frequency < 60) {
          // Sub bass - deep blue
          gradient.addColorStop(0, '#1e3a8a');
          gradient.addColorStop(1, '#3b82f6');
        } else if (frequency < 250) {
          // Bass - blue
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(1, '#60a5fa');
        } else if (frequency < 2000) {
          // Low mid - green
          gradient.addColorStop(0, '#059669');
          gradient.addColorStop(1, '#10b981');
        } else if (frequency < 4000) {
          // Mid - yellow
          gradient.addColorStop(0, '#d97706');
          gradient.addColorStop(1, '#f59e0b');
        } else if (frequency < 8000) {
          // High mid - orange
          gradient.addColorStop(0, '#dc2626');
          gradient.addColorStop(1, '#ef4444');
        } else {
          // High - red
          gradient.addColorStop(0, '#991b1b');
          gradient.addColorStop(1, '#dc2626');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Draw target lines if provided
      if (targetLufs !== undefined) {
        const targetY = canvas.height - ((targetLufs + 70) / 70) * canvas.height;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(canvas.width, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (targetTruePeak !== undefined) {
        const targetY = canvas.height - ((targetTruePeak + 70) / 70) * canvas.height;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(canvas.width, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, targetLufs, targetTruePeak]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-center">{title}</h4>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          className="w-full h-24 bg-gray-900 rounded-lg border border-gray-700"
        />
        {isAnalyzing && (
          <div className="absolute top-2 left-2 text-xs space-y-1">
            <div className="text-yellow-400">
              LUFS: {lufsValue.toFixed(1)} dB
            </div>
            <div className="text-red-400">
              Peak: {peakValue.toFixed(1)} dB
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrequencySpectrum;
