import React, { useRef, useEffect } from 'react';

interface GoniometerProps {
  goniometerData: number[];
}

const Goniometer: React.FC<GoniometerProps> = ({ goniometerData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !goniometerData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    bgGradient.addColorStop(0, '#1f2937');
    bgGradient.addColorStop(1, '#111827');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw circular grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Draw concentric circles
    for (let i = 1; i <= 4; i++) {
      const circleRadius = (radius / 4) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw cross lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Draw diagonal lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.707, centerY - radius * 0.707);
    ctx.lineTo(centerX + radius * 0.707, centerY + radius * 0.707);
    ctx.moveTo(centerX + radius * 0.707, centerY - radius * 0.707);
    ctx.lineTo(centerX - radius * 0.707, centerY + radius * 0.707);
    ctx.stroke();

    // Draw goniometer data points
    if (goniometerData.length > 0) {
      // Calculate stereo correlation from time domain data
      const dataLength = goniometerData.length;
      const leftChannel = goniometerData.slice(0, dataLength / 2);
      const rightChannel = goniometerData.slice(dataLength / 2);
      
      // Create goniometer visualization
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      
      // Draw correlation line
      const correlation = 0.8; // This should come from meterData.correlation
      const angle = Math.acos(Math.max(-1, Math.min(1, correlation))) * (correlation < 0 ? -1 : 1);
      const endX = centerX + Math.cos(angle) * radius * 0.8;
      const endY = centerY - Math.sin(angle) * radius * 0.8;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw stereo field points
      ctx.fillStyle = '#3b82f6';
      ctx.globalAlpha = 0.6;
      
      for (let i = 0; i < Math.min(leftChannel.length, 100); i += 2) {
        const left = (leftChannel[i] - 128) / 128;
        const right = (rightChannel[i] - 128) / 128;
        
        if (Math.abs(left) > 0.01 || Math.abs(right) > 0.01) {
          const x = centerX + (left + right) * radius * 0.5;
          const y = centerY - (left - right) * radius * 0.5;
          
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw center point
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('L', centerX - radius - 15, centerY);
    ctx.fillText('R', centerX + radius + 15, centerY);
    ctx.fillText('C', centerX, centerY - radius - 15);
    ctx.fillText('S', centerX, centerY + radius + 15);
  }, [goniometerData]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-64 h-64 bg-gray-800 rounded-lg border border-gray-600"
      />
    </div>
  );
};

export default Goniometer;
