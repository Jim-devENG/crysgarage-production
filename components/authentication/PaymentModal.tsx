import React, { useState } from 'react';
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

  console.log('PaymentModal render - user:', user, 'isAuthenticated:', isAuthenticated);

  const tiers = {
    free: {
      id: 'free',
      name: 'Pay Per Download',
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
      name: 'Professional',
      price: 0.00,
      credits: 999999,
      description: 'Free - Unlimited credits',
      features: [
        'Unlimited mastering credits',
        'Crysgarage Mastering Engine',
        'Genre-specific presets',
        'High-quality exports',
        'WAV, MP3, FLAC formats',
        '+16 tuning (free)',
        'All genres included',
        'Live preview & feedback',
        'Best value - unlimited downloads'
      ],
      icon: <Zap className="w-6 h-6" />
    },
    advanced: {
      id: 'advanced',
      name: 'Advanced Manual',
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
      // Handle free professional tier
      if (selectedTier === 'professional' && selectedTierInfo.price === 0.00) {
        console.log('Free professional tier - granting credits directly');
        onPaymentSuccess(selectedTierInfo.credits);
        return;
      }

      // Convert USD to NGN for Paystack
      const currencyConversion = convertUSDToNGN(selectedTierInfo.price);
      const reference = `CRYS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const callbackUrl = `${window.location.origin}/payment-success?tier=${selectedTier}&credits=${selectedTierInfo.credits}`;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-crys-black border border-crys-graphite">
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

          {/* Payment Button */}
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

          {/* Security Note */}
          <div className="text-center">
            <p className="text-crys-light-grey text-xs">
              Secure payment powered by Paystack
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
