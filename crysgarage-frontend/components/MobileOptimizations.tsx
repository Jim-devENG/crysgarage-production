import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Hand, 
  Gesture,
  Menu,
  Navigation,
  Zap
} from "lucide-react";

interface MobileOptimizationsProps {
  children: React.ReactNode;
}

export function MobileOptimizations({ children }: MobileOptimizationsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setTouchDevice('ontouchstart' in window);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div className="relative">
      {/* Mobile-specific optimizations overlay */}
      <div className={`${isMobile ? 'mobile-optimized' : ''} ${isTablet ? 'tablet-optimized' : ''} ${touchDevice ? 'touch-optimized' : ''}`}>
        {children}
      </div>

      {/* Development indicator for mobile optimization status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-audio-panel-bg border-audio-panel-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                {isMobile && <Smartphone className="w-4 h-4 text-green-400" />}
                {isTablet && <Tablet className="w-4 h-4 text-yellow-400" />}
                {!isMobile && !isTablet && <Monitor className="w-4 h-4 text-blue-400" />}
                {touchDevice && <Hand className="w-4 h-4 text-crys-gold" />}
                <span className="text-crys-white">
                  {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
                  {touchDevice ? ' Touch' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Hook for detecting mobile device capabilities
export function useMobileOptimization() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    supportsHover: false,
    orientation: 'portrait' as 'portrait' | 'landscape'
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isTouch: 'ontouchstart' in window,
        supportsHover: window.matchMedia('(hover: hover)').matches,
        orientation: height > width ? 'portrait' : 'landscape'
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Mobile-optimized component wrapper
export function MobileWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isMobile, isTablet, isTouch } = useMobileOptimization();

  const mobileClasses = [
    isMobile ? 'mobile-layout' : '',
    isTablet ? 'tablet-layout' : '',
    isTouch ? 'touch-interface' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={mobileClasses}>
      {children}
    </div>
  );
}