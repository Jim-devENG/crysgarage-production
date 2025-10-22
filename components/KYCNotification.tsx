import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  AlertCircle, 
  X, 
  User, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthenticationContext';

interface KYCNotificationProps {
  onNavigate: (page: string) => void;
}

export function KYCNotification({ onNavigate }: KYCNotificationProps) {
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Check if user has completed KYC - if so, never show notification again
    if (user.kyc_verified) {
      setShowNotification(false);
      return;
    }

    // Check if user has been logged in for more than 5 minutes
    const loginTime = localStorage.getItem('user_login_time');
    if (!loginTime) {
      localStorage.setItem('user_login_time', Date.now().toString());
      return;
    }

    const loginTimestamp = parseInt(loginTime);
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    const timeSinceLogin = Date.now() - loginTimestamp;

    // Show notification if user has been logged in for more than 5 minutes and hasn't completed KYC
    if (timeSinceLogin > fiveMinutes && !user.kyc_verified) {
      setShowNotification(true);
      
      // Calculate time remaining (show for 24 hours)
      const maxShowTime = 24 * 60 * 60 * 1000; // 24 hours
      const remainingTime = maxShowTime - timeSinceLogin;
      setTimeRemaining(Math.max(0, remainingTime));
    }
  }, [user, user?.kyc_verified]);

  useEffect(() => {
    if (!showNotification) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          setShowNotification(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showNotification]);

  const handleUpdateProfile = () => {
    onNavigate('profile');
    setShowNotification(false);
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!showNotification || user?.kyc_verified) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <Card className="bg-crys-graphite border-crys-gold/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-crys-gold/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-crys-gold" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-crys-white font-semibold text-sm">Complete Your Profile</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 text-crys-light-grey hover:text-crys-white"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <p className="text-crys-light-grey text-xs mb-3">
                Please complete your KYC verification to access all features and ensure account security.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-crys-gold" />
                  <span className="text-crys-gold text-xs">
                    {timeRemaining > 0 ? `Remaining: ${formatTime(timeRemaining)}` : 'Expiring soon'}
                  </span>
                </div>
                
                <Button
                  onClick={handleUpdateProfile}
                  size="sm"
                  className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black text-xs px-3 py-1"
                >
                  <User className="w-3 h-3 mr-1" />
                  Update Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
