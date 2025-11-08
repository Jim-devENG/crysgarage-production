import React, { useEffect, useRef } from 'react';

interface SpectrumVisualizerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
}

const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({ analyser, width = 600, height = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufferRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyser || !ctx) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const bins = analyser.frequencyBinCount;
      if (!bufferRef.current || bufferRef.current.length !== bins) {
        bufferRef.current = new Uint8Array(bins);
      }
      analyser.getByteFrequencyData(bufferRef.current as any);

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background
      ctx.fillStyle = '#0b0b0b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = Math.max(1, (canvas.width / bins) * 1.2);
      let x = 0;
      for (let i = 0; i < bins; i++) {
        const v = bufferRef.current[i] / 255; // 0..1
        const barHeight = v * canvas.height;
        // Gold gradient bars
        const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(1, '#8B6B00');
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
        if (x > canvas.width) break;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-28 rounded-md border border-audio-panel-border block"
    />
  );
};

export default SpectrumVisualizer;



