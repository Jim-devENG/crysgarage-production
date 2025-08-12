import React, { useRef, useEffect, useState } from 'react';

interface FrequencySpectrumProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  title: string;
  className?: string;
}

const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({ 
  audioElement, 
  isPlaying, 
  title,
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 120;

    // Create audio context and analyzer
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    
    // Configure analyzer
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    // Create source from audio element
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Store references
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioElement]);

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
          gradient.addColorStop(0, '#ea580c');
          gradient.addColorStop(1, '#f97316');
        } else {
          // Brilliance - red
          gradient.addColorStop(0, '#dc2626');
          gradient.addColorStop(1, '#ef4444');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Draw frequency labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      const frequencies = [60, 250, 1000, 4000, 8000, 16000];
      frequencies.forEach(freq => {
        const binIndex = Math.floor(freq * analyser.fftSize / (audioContextRef.current?.sampleRate || 44100));
        const xPos = (binIndex / bufferLength) * canvas.width;
        if (xPos < canvas.width) {
          ctx.fillText(freq < 1000 ? `${freq}Hz` : `${freq/1000}k`, xPos, canvas.height - 5);
        }
      });
    };

    draw();
  }, [isPlaying]);

  return (
    <div className={`bg-gray-700 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-300">
            {isAnalyzing ? 'Live' : 'Ready'}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[120px] bg-gray-800 rounded border border-gray-600"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Frequency range indicators */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Sub</span>
          <span>Bass</span>
          <span>Low</span>
          <span>High</span>
          <span>Pres</span>
          <span>Brill</span>
        </div>
      </div>
    </div>
  );
};

export default FrequencySpectrum;
