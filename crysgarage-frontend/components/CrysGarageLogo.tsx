import React from 'react';

interface CrysGarageLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function CrysGarageLogo({ size = 40, className = "", onClick }: CrysGarageLogoProps) {
  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      {/* Main Logo Container */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="w-full h-full"
      >
        {/* Background Circle with Metallic Texture */}
        <defs>
          <radialGradient id="metallicGold" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="40%" stopColor="#FFA500" />
            <stop offset="70%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B6914" />
          </radialGradient>
          
          {/* Noise/Texture Filter */}
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.3 0" result="noiseMatrix"/>
            <feBlend mode="multiply" in="SourceGraphic" in2="noiseMatrix"/>
          </filter>
          
          {/* Inner Glow */}
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer Circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="url(#metallicGold)" 
          filter="url(#noise)"
          stroke="#B8860B" 
          strokeWidth="2"
        />
        
        {/* Inner Circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="3"
          opacity="0.8"
        />
        
        {/* G Symbol - Vertical Bar */}
        <rect 
          x="47" 
          y="20" 
          width="6" 
          height="25" 
          fill="url(#metallicGold)" 
          filter="url(#innerGlow)"
          rx="1"
        />
        
        {/* G Symbol - Horizontal Bar */}
        <rect 
          x="47" 
          y="35" 
          width="15" 
          height="6" 
          fill="url(#metallicGold)" 
          filter="url(#innerGlow)"
          rx="1"
        />
        
        {/* G Symbol - Curved Part (simplified as additional rectangle) */}
        <rect 
          x="47" 
          y="35" 
          width="6" 
          height="10" 
          fill="url(#metallicGold)" 
          filter="url(#innerGlow)"
          rx="1"
        />
        
        {/* Highlight/Shine Effect */}
        <circle 
          cx="35" 
          cy="35" 
          r="8" 
          fill="rgba(255, 255, 255, 0.3)" 
          opacity="0.6"
        />
      </svg>
      
      {/* Animated Pulse Effect */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-crys-gold rounded-full pulse-gold"></div>
    </div>
  );
}

// CSS for the pulse animation (add this to your global CSS or create a separate style)
const pulseStyles = `
  @keyframes pulse-gold {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
  
  .pulse-gold {
    animation: pulse-gold 2s ease-in-out infinite;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleId = 'crys-garage-logo-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = pulseStyles;
    document.head.appendChild(style);
  }
}