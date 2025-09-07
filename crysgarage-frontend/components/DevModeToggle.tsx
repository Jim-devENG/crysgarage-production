import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Settings, Zap, Shield } from 'lucide-react';

interface DevModeToggleProps {
  onToggle?: (enabled: boolean) => void;
}

export function DevModeToggle({ onToggle }: DevModeToggleProps) {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check if Dev Mode is enabled via environment variable
    const devMode = import.meta.env.VITE_DEV_MODE === 'true';
    setIsDevMode(devMode);
  }, []);

  const handleToggle = () => {
    const newState = !isDevMode;
    setIsDevMode(newState);
    
    // Update environment variable (this won't persist across page reloads)
    // In a real implementation, you'd need to restart the dev server
    console.warn('⚠️ Dev Mode toggle requires environment variable change and server restart');
    console.warn('⚠️ Set VITE_DEV_MODE=true in your .env file and restart the dev server');
    
    onToggle?.(newState);
  };

  // Only show in development environment
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-crys-black/90 backdrop-blur-sm border border-crys-graphite rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-crys-gold" />
          <span className="text-sm font-medium text-crys-white">Dev Mode</span>
          <Badge 
            variant={isDevMode ? "default" : "secondary"}
            className={`text-xs ${isDevMode ? 'bg-green-600' : 'bg-crys-graphite'}`}
          >
            {isDevMode ? 'ON' : 'OFF'}
          </Badge>
        </div>
        
        <div className="text-xs text-crys-light-grey mb-2">
          {isDevMode ? (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              Auth & Payments bypassed
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-500" />
              Production mode
            </div>
          )}
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggle}
          className="w-full text-xs"
        >
          {isDevMode ? 'Disable' : 'Enable'} Dev Mode
        </Button>
        
        <div className="text-xs text-crys-light-grey mt-2 text-center">
          Requires server restart
        </div>
      </div>
    </div>
  );
}
