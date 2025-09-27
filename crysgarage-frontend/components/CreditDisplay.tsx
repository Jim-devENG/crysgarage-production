import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Coins, Plus, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthenticationContext';
import { creditService } from '../services/creditService';

interface CreditDisplayProps {
  onPurchaseClick?: () => void;
  showPurchaseButton?: boolean;
  className?: string;
}

export function CreditDisplay({ 
  onPurchaseClick, 
  showPurchaseButton = true, 
  className = "" 
}: CreditDisplayProps) {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchCreditBalance();
    }
  }, [user?.id]);

  const fetchCreditBalance = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const balance = await creditService.getCreditBalance(user.id);
      setCreditBalance(balance.current);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch credit balance:', err);
      setError('Failed to load credits');
      // Fallback to local user credits
      setCreditBalance(user.credits || 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    if (onPurchaseClick) {
      onPurchaseClick();
    } else {
      // Default behavior - navigate to pricing
      window.location.href = '/pricing';
    }
  };

  const getCreditStatus = () => {
    if (creditBalance === 0) {
      return {
        status: 'exhausted',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: AlertTriangle,
        message: 'No credits remaining'
      };
    } else if (creditBalance <= 2) {
      return {
        status: 'low',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: AlertTriangle,
        message: 'Credits running low'
      };
    } else {
      return {
        status: 'good',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        icon: Coins,
        message: 'Credits available'
      };
    }
  };

  const creditStatus = getCreditStatus();
  const StatusIcon = creditStatus.icon;

  if (isLoading) {
    return (
      <Card className={`bg-crys-graphite border-crys-graphite ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-crys-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-crys-light-grey">Loading credits...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-crys-graphite border-crys-graphite ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${creditStatus.bgColor} ${creditStatus.borderColor} border`}>
              <StatusIcon className={`w-4 h-4 ${creditStatus.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-crys-white font-medium">
                  {creditBalance} Credit{creditBalance !== 1 ? 's' : ''}
                </span>
                <Badge 
                  variant="outline" 
                  className={`${creditStatus.color} ${creditStatus.borderColor} border`}
                >
                  {creditStatus.message}
                </Badge>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-1">{error}</p>
              )}
            </div>
          </div>
          
          {showPurchaseButton && (
            <Button
              onClick={handlePurchaseClick}
              size="sm"
              className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black"
            >
              <Plus className="w-4 h-4 mr-1" />
              Buy Credits
            </Button>
          )}
        </div>
        
        {creditBalance === 0 && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>You have no credits remaining. Purchase credits to continue processing audio.</span>
            </div>
            <Button
              onClick={handlePurchaseClick}
              size="sm"
              className="mt-2 bg-crys-gold hover:bg-crys-gold/90 text-crys-black"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Purchase Credits
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CreditDisplay;
