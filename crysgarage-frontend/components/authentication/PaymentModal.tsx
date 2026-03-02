import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  CreditCard, 
  Shield, 
  Zap, 
  Crown, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthenticationContext';
import { initializeDirectPaystack } from '../Payments/PaystackDirect';
import { convertUSDToNGN, formatNGN } from '../../utils/currencyConverter';
import { CryptoPaymentModal } from '../Payment/CryptoPaymentModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
  onPaymentSuccess: (credits: number) => void;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  selectedTier, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  console.log('PaymentModal render - user:', user, 'isAuthenticated:', isAuthenticated);

  const tiers = {
    free: {
      id: 'free',
      name: 'Sapphire Studio',
      price: 5.00,
      credits: 1,
      description: '$5 for 1 download',
      features: [
        '1 download credit',
        'High-quality mastered track',
        'Download in WAV/MP3/FLAC',
        'Professional mastering',
        'Instant download',
        'No subscription required'
      ],
      icon: <Shield className="w-6 h-6" />
    },
    professional: {
      id: 'professional',
      name: 'Emerald Studio',
      price: 4.00,
      credits: 1,
      description: '$4 per download',
      features: [
        '1 download credit',
        'Crysgarage Mastering Engine',
        'Genre-specific presets',
        'High-quality exports',
        'WAV, MP3, FLAC, AIFF formats',
        '+16 tuning (free)',
        'All genres included',
        'Live preview & feedback',
        'Pay per download - no subscription'
      ],
      icon: <Zap className="w-6 h-6" />
    },
    advanced: {
      id: 'advanced',
      name: 'Jasper Studio',
      price: 25.00,
      credits: 6, // 5 credits + 1 bonus
      description: '$25 for 5 credits + 1 bonus credit',
      features: [
        '5 credits + 1 bonus credit',
        'Real-time manual controls',
        '8-band graphic EQ',
        'Advanced compression',
        'Stereo imaging controls',
        'Limiter settings',
        'A/B comparison',
        'All sample rates & formats',
        '+16 tuning (free)',
        'All genres included',
        'Live preview & feedback',
        'Best value with bonus credit'
      ],
      icon: <Crown className="w-6 h-6" />
    }
  };

  const selectedTierInfo = tiers[selectedTier as keyof typeof tiers] || tiers.free;

  const handlePaystackPayment = async () => {
    console.log('PaymentModal: handlePaystackPayment called - user:', user, 'isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated || !user?.email) {
      alert('Please sign in to make a payment');
      return;
    }

    setIsProcessing(true);

    try {
      // Professional tier now requires $4 payment per download
      // No free tier bypass

      // Convert USD to NGN for Paystack
      const currencyConversion = convertUSDToNGN(selectedTierInfo.price);
      const reference = `CRYS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Different callback URLs based on tier
      let callbackUrl: string;
      // Determine redirect target based on tier
      const redirectTarget = selectedTier === 'advanced' ? 'advanced' : selectedTier === 'professional' ? 'professional' : 'dashboard';
      
      if (selectedTier === 'free') {
        // Sapphire: redirect to dashboard after payment
        callbackUrl = `${window.location.origin}/payment-success?tier=free&credits=1&redirect=${redirectTarget}&mode=test`;
      } else if (selectedTier === 'advanced') {
        // Jasper: redirect to advanced dashboard after payment with 6 credits
        callbackUrl = `${window.location.origin}/payment-success?tier=advanced&credits=6&redirect=${redirectTarget}&mode=test`;
      } else {
        // Professional (Emerald) - handled differently at download
        callbackUrl = `${window.location.origin}/payment-success?tier=${selectedTier}&credits=${selectedTierInfo.credits}&redirect=${redirectTarget}&mode=test`;
      }

      console.log('Starting Paystack payment:', {
        tier: selectedTier,
        price: selectedTierInfo.price,
        ngnAmount: currencyConversion.ngn,
        ngnCents: currencyConversion.ngnCents,
        credits: selectedTierInfo.credits
      });

      // Use direct Paystack integration
      const authUrl = await initializeDirectPaystack({
        amountCents: currencyConversion.ngnCents,
        email: user.email,
        reference,
        callbackUrl,
        metadata: { 
          tier: selectedTier, 
          credits: selectedTierInfo.credits, 
          user_id: user.id,
          original_usd: selectedTierInfo.price,
          converted_ngn: currencyConversion.ngn
        }
      });

      if (authUrl === 'inline_redirect') {
        // Paystack modal is already opened inline
        console.log('Paystack modal opened inline');
      } else if (authUrl) {
        // Redirect to Paystack payment page
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Paystack payment failed:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // CRITICAL: Modal must be cancelable - support ESC key and backdrop click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose} // Backdrop click closes modal
    >
      <Card 
        className="w-full max-w-md bg-crys-black border border-crys-graphite"
        onClick={(e) => e.stopPropagation()} // Prevent card click from closing modal
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-crys-white flex items-center gap-2">
            {selectedTierInfo.icon}
            {selectedTierInfo.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-crys-light-grey hover:text-crys-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tier Info */}
          <div className="text-center">
            <div className="text-3xl font-bold text-crys-gold mb-2">
              ${selectedTierInfo.price}
            </div>
            <div className="text-crys-light-grey text-sm mb-4">
              {formatNGN(convertUSDToNGN(selectedTierInfo.price).ngn)} NGN
            </div>
            <p className="text-crys-white text-sm">
              {selectedTierInfo.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-crys-white font-medium">What's included:</h4>
            <ul className="space-y-2">
              {selectedTierInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-crys-light-grey">
                  <div className="w-1.5 h-1.5 bg-crys-gold rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Credits Info */}
          <div className="p-4 rounded-lg bg-crys-gold/10 border border-crys-gold/20">
            <div className="flex items-center justify-between">
              <span className="text-crys-white font-medium">Credits:</span>
              <Badge className="bg-crys-gold text-crys-black">
                {selectedTierInfo.credits === -1 ? 'Unlimited' : selectedTierInfo.credits}
              </Badge>
            </div>
            <p className="text-crys-light-grey text-xs mt-2">
              {selectedTierInfo.credits === -1 
                ? 'Unlimited downloads and mastering sessions'
                : `${selectedTierInfo.credits} download${selectedTierInfo.credits > 1 ? 's' : ''} included`
              }
            </p>
            {selectedTier === 'professional' || selectedTier === 'advanced' ? (
              <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-xs">
                  🎉 <strong>Welcome Bonus:</strong> Get 2 free credits when you sign up for the first time!
                </p>
              </div>
            ) : null}
          </div>

          {/* Payment Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handlePaystackPayment}
              disabled={isProcessing}
              className="w-full bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-medium"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pay {formatNGN(convertUSDToNGN(selectedTierInfo.price).ngn)} NGN
                  <ExternalLink className="w-4 h-4" />
                </div>
              )}
            </Button>

            <Button
              onClick={() => setShowCryptoModal(true)}
              disabled={isProcessing}
              variant="outline"
              className="w-full border-crys-gold text-crys-gold hover:bg-crys-gold/10"
            >
              Pay with Crypto
            </Button>
          </div>

          {/* Security Note */}
          <div className="text-center">
            <p className="text-crys-light-grey text-xs">
              Secure payment powered by Paystack
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Payment Modal */}
      <CryptoPaymentModal
        isOpen={showCryptoModal}
        onClose={() => setShowCryptoModal(false)}
        selectedTier={selectedTier as 'free' | 'professional' | 'advanced'}
        onPaymentSuccess={onPaymentSuccess}
      />
    </div>
  );
}
