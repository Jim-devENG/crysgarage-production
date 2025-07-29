import React from 'react';

interface CrysGarageLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function CrysGarageLogo({ size = 40, className = "", onClick }: CrysGarageLogoProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      {/* PNG Logo Image with Fallback */}
      {!imageError ? (
        <img 
          src="/crys-garage-logo.png" 
          alt="Crys Garage Logo" 
          className="w-full h-full object-contain"
          style={{ width: size, height: size }}
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback: Simple G symbol
        <div 
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-lg"
          style={{ width: size, height: size }}
        >
          <span className="text-crys-black font-extrabold text-lg">
            G
          </span>
        </div>
      )}
      
      {/* Animated Pulse Effect */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-crys-gold rounded-full pulse-gold"></div>
    </div>
  );
}

// CSS for the pulse animation
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