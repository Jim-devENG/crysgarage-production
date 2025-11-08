import React, { useRef, useEffect } from 'react';

interface FrequencyMeterProps {
  frequencyData: number[];
  title: string;
  detailed?: boolean;
  compact?: boolean;
}

const FrequencyMeter: React.FC<FrequencyMeterProps> = ({ 
  frequencyData, 
  title, 
  detailed = false,
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frequencyData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1f2937');
    bgGradient.addColorStop(1, '#111827');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines (only if not compact)
    if (!compact) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5;
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = (height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines (logarithmic frequency scale)
      const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
      frequencies.forEach(freq => {
        const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      });
    }

    // Draw frequency spectrum
    const barWidth = width / frequencyData.length;
    
    frequencyData.forEach((value, index) => {
      const normalizedValue = value / 255;
      const barHeight = normalizedValue * height * 0.8;
      const x = index * barWidth;
      const y = height - barHeight;

      // Create dynamic gradient based on frequency
      const gradient = ctx.createLinearGradient(x, y, x, height);
      if (index < frequencyData.length * 0.3) {
        // Low frequencies - blue to cyan
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#06b6d4');
      } else if (index < frequencyData.length * 0.7) {
        // Mid frequencies - green to yellow
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#f59e0b');
      } else {
        // High frequencies - orange to red
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ef4444');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw frequency labels (only if not compact)
    if (!compact) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      
      const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
      frequencies.forEach(freq => {
        const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
        ctx.fillText(`${freq}Hz`, x, height - 5);
      });

      // Draw amplitude labels
      ctx.textAlign = 'right';
      for (let i = 0; i <= 10; i++) {
        const y = (height / 10) * i;
        const db = -60 + (i * 6);
        ctx.fillText(`${db}dB`, width - 5, y + 3);
      }
    }
  }, [frequencyData, compact]);

  return (
    <div className="space-y-3">
      {title && <h4 className="text-sm font-semibold text-white">{title}</h4>}
      <canvas
        ref={canvasRef}
        width={compact ? 300 : (detailed ? 600 : 400)}
        height={compact ? 60 : (detailed ? 300 : 200)}
        className="w-full bg-gray-800 rounded border border-gray-600"
      />
    </div>
  );
};

export default FrequencyMeter;
