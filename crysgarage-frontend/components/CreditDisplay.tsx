import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Coins, Plus, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthenticationContext';
// CRITICAL: Removed creditService import - this component ONLY uses AuthenticationContext.user.credits
import { DEV_MODE, getDevCreditsResponse, getDevUser, isDevModeActive } from '../utils/secureDevMode';

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
  // Get tier-specific credits - show the tier with the most credits, or free if equal
  const freeCredits = user?.free_credits ?? 0;
  const advancedCredits = user?.advanced_credits ?? 0;
  
  // Determine which tier to display: show the one with more credits, or free if equal
  const displayTier = advancedCredits > freeCredits ? 'advanced' : 'free';
  const creditBalance = displayTier === 'advanced' ? advancedCredits : freeCredits;
  const tierLabel = displayTier === 'advanced' ? 'Advanced' : 'Free';
  
  // Only check for actual dev mode, not based on credits value
  const isDevUser = DEV_MODE || (user?.id === 'dev-user' || user?.email === 'dev@local.test');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRITICAL: Use tier-specific credits from AuthenticationContext as SINGLE SOURCE OF TRUTH
  // Backend is authoritative - AuthenticationContext fetches from backend
  // This component ONLY displays credits from context - NO independent fetching, NO creditService calls
  useEffect(() => {
    if (isDevUser) {
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // CRITICAL: Always use tier-specific credits from context (backend is authoritative)
    // Do NOT fetch independently - this causes state drift
    // Do NOT call creditService - AuthenticationContext is the only source
    if (user?.id) {
      setIsLoading(false);
      setError(null);
    } else {
      // No user - set to loading
      setIsLoading(false);
    }
  }, [user?.id, user?.free_credits, user?.advanced_credits, isDevUser]); // CRITICAL: Watch tier-specific credits to update display when backend updates

  // CRITICAL: Removed fetchCreditBalance - this component ONLY reads from AuthenticationContext.user.credits
  // No creditService calls, no independent API calls, no state drift

  const handlePurchaseClick = () => {
    if (onPurchaseClick) {
      onPurchaseClick();
    } else {
      // Default behavior - navigate to billing
          if (!isDevUser) {
            window.location.href = '/billing';
          }
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
        message: isDevUser ? 'Dev Mode: Unlimited credits' : 'Credits available'
      };
    }
  };

  const creditStatus = getCreditStatus();
  const StatusIcon = creditStatus.icon;

  if (isDevUser) {
    // In Dev Mode (or dev user), suppress credit UI entirely
    return null;
  }

  if (isLoading) {
    // Compact loading for header
    if (className.includes('compact') || className.includes('header')) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="w-3 h-3 border-2 border-crys-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-crys-light-grey text-xs">...</span>
        </div>
      );
    }
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

  // Compact version for header
  if (className.includes('compact') || className.includes('header')) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`p-1.5 rounded ${creditStatus.bgColor} ${creditStatus.borderColor} border`}>
          <StatusIcon className={`w-3 h-3 ${creditStatus.color}`} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-crys-white text-sm font-medium">
            {Number.isFinite(creditBalance) ? creditBalance : 0}
          </span>
          <span className="text-crys-light-grey text-xs font-normal">
            {tierLabel}
          </span>
        </div>
        {showPurchaseButton && !isDevUser && creditBalance === 0 && (
          <Button
            onClick={handlePurchaseClick}
            size="sm"
            className="h-7 px-2 text-xs bg-crys-gold hover:bg-crys-gold/90 text-crys-black"
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>
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
                  {Number.isFinite(creditBalance) ? creditBalance : 0} {tierLabel} Credit{(Number.isFinite(creditBalance) ? creditBalance : 0) !== 1 ? 's' : ''}
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
          
          {showPurchaseButton && !isDevUser && (
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
        
        {creditBalance === 0 && !isDevUser && (
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
