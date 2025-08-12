import React, { useRef, useEffect, useState } from 'react';

interface FrequencySpectrumProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  title: string;
}

const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  audioElement,
  isPlaying,
  title
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [source, setSource] = useState<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyserNode = ctx.createAnalyser();
    const sourceNode = ctx.createMediaElementSource(audioElement);

    analyserNode.fftSize = 256;
    sourceNode.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    setAudioContext(ctx);
    setAnalyser(analyserNode);
    setSource(sourceNode);

    return () => {
      if (sourceNode) {
        sourceNode.disconnect();
      }
      if (analyserNode) {
        analyserNode.disconnect();
      }
      if (ctx) {
        ctx.close();
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(17, 24, 39)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(1, '#f59e0b');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h4 className="font-semibold text-white mb-3">{title} Frequency Spectrum</h4>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full h-48 bg-gray-800 rounded border border-gray-600"
      />
      {!isPlaying && (
        <div className="text-center text-gray-400 text-sm mt-2">
          Play audio to see frequency spectrum
        </div>
      )}
    </div>
  );
};

export default FrequencySpectrum;
