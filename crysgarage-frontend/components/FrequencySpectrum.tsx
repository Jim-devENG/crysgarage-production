import React, { useRef, useEffect, useState } from 'react';

interface FrequencySpectrumProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  title: string;
  targetLufs?: number;
  targetTruePeak?: number;
  isAudioConnected?: boolean; // New prop to indicate if audio is already connected to Web Audio API
  analyserNode?: AnalyserNode | null; // Shared analyzer node from parent
}

const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  audioElement,
  isPlaying,
  title,
  targetLufs,
  targetTruePeak,
  isAudioConnected = false,
  analyserNode = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lufsValue, setLufsValue] = useState<number>(0);
  const [peakValue, setPeakValue] = useState<number>(0);

  useEffect(() => {
    if (!audioElement) {
      return;
    }

    if (analyserNode) {
      // Use the shared analyzer node from parent
      analyserRef.current = analyserNode;
      return;
    }

    // Create audio context and analyzer
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    
    // Configure analyzer
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    if (!isAudioConnected) {
      // Create source from audio element only if not already connected
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = source;
    } else {
      // If already connected, just connect analyzer to destination for visualization
      analyser.connect(audioContext.destination);
    }

    // Store references
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioElement, isAudioConnected, analyserNode]);

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
          // Low mids - green
          gradient.addColorStop(0, '#059669');
          gradient.addColorStop(1, '#10b981');
        } else if (frequency < 4000) {
          // High mids - yellow
          gradient.addColorStop(0, '#d97706');
          gradient.addColorStop(1, '#f59e0b');
        } else if (frequency < 8000) {
          // Presence - orange
          gradient.addColorStop(0, '#dc2626');
          gradient.addColorStop(1, '#ef4444');
        } else {
          // Air - red
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

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">{title}</h4>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">LUFS:</span>
            <span className={`font-mono ${lufsValue > -14 ? 'text-red-400' : 'text-green-400'}`}>
              {lufsValue.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">Peak:</span>
            <span className={`font-mono ${peakValue > -1 ? 'text-red-400' : 'text-green-400'}`}>
              {peakValue.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative bg-gray-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-24"
          style={{ background: 'linear-gradient(to bottom, #1f2937, #111827)' }}
        />
        
        {!isAnalyzing && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Analyzing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrequencySpectrum;
